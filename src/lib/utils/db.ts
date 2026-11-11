import {
  AsyncDuckDB,
  type AsyncDuckDBConnection,
  ConsoleLogger,
  DuckDBDataProtocol,
  getJsDelivrBundles,
  selectBundle
} from '@duckdb/duckdb-wasm';
import type { Feature, FeatureCollection } from 'geojson';

import type {
  DuckDBColumn,
  DuckDBGeometryType,
  DuckDBTable
} from '$lib/types/db';
import type { CartoKitSource, CartoKitTableSource } from '$lib/types/source';
import type { Transformation } from '$lib/types/transformation';

const DUCKDB_BUNDLES = getJsDelivrBundles();

/**
 * Initialize a DuckDB in-memory database.
 *
 * @returns An Object continaing:
 *  1. The initialized {@link AsyncDuckDB} instance
 *  2. A reference to the {@link Worker} thread running the instance.
 *  3. The active {@link AsyncDuckDBConnection}.
 */
export async function initDB() {
  const bundle = await selectBundle(DUCKDB_BUNDLES);
  const workerURL = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker}");`], {
      type: 'text/javascript'
    })
  );

  // Instantiate the asynchronous version of DuckDB-wasm
  const worker = new Worker(workerURL);
  const logger = new ConsoleLogger();
  const db = new AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  URL.revokeObjectURL(workerURL);

  // Cast types that Arrow would otherwise surface as BigInt or Decimal objects
  // to plain numbers. MapLibre cannot serialize these when tiling GeoJSON.
  await db.open({
    query: {
      castBigIntToDouble: true,
      castDecimalToDouble: true,
      castTimestampToDate: true
    }
  });

  // Install and load the Spatial extension at startup.
  // See https://github.com/duckdb/duckdb-wasm/issues/2199 for why the call to
  // duckdb_coordinate_systems is necessary to support GeoParquet loading.
  const conn = await db.connect();
  await conn.query(`SELECT * FROM duckdb_coordinate_systems();
INSTALL spatial;
LOAD spatial;`);

  return { db, worker, conn };
}

/**
 * Generate a SQL CREATE TABLE statement for a given layerId and data source.
 *
 * @param layerId The layerId to use as the table name.
 * @param source The data source, either a
 * @returns A SQL CREATE TABLE statement.
 */
export function generateCreateTableStatement(layerId: string, source: string) {
  const reader = /\.(geo)?parquet$/.test(source) ? `read_parquet` : `ST_Read`;

  return `CREATE TABLE ${layerId} AS SELECT * FROM ${reader}('${source}');`;
}

/**
 * Generate the SQL expression that applies a {@link Transformation} to a
 * geometry column.
 *
 * @param transformation The {@link Transformation} to apply.
 * @param geometryColumn The name of the geometry column to transform.
 * @returns A SQL expression evaluating to the transformed geometry.
 */
export function generateTransformationExpression(
  transformation: Transformation,
  geometryColumn: string
): string {
  switch (transformation.type) {
    case 'Buffer':
      return `ST_Transform(ST_Buffer(ST_Transform(${quoteIdentifier(geometryColumn)}, 'EPSG:4326', 'EPSG:3857', always_xy := true), ${transformation.args.distance}), 'EPSG:3857', 'EPSG:4326', always_xy := true)`;
    case 'Centroid':
      return `ST_Centroid(${quoteIdentifier(geometryColumn)})`;
    case 'Envelope':
      return `ST_Envelope(${quoteIdentifier(geometryColumn)})`;
  }
}

/**
 * Generate a SQL CREATE TABLE statement for a layer derived from another
 * layer's table, replacing the parent's geometry with its transformed geometry.
 *
 * @param layerId The layerId to use as the table name.
 * @param location The location of the derived {@link CartoKitTableSource}.
 * @param geometryColumn The name of the parent table's geometry column.
 * @returns A SQL CREATE TABLE statement.
 */
export function generateCreateDerivedTableStatement(
  layerId: string,
  { parentLayerId, transformation }: CartoKitTableSource['location'],
  geometryColumn: string
) {
  return `CREATE TABLE ${layerId} AS SELECT * REPLACE (${generateTransformationExpression(transformation, geometryColumn)} AS ${quoteIdentifier(geometryColumn)}) FROM ${parentLayerId};`;
}

/**
 * Generate the select list of a query reading all data as GeoJSON-ready
 * columns: nested properties serialized to JSON, and the geometry serialized
 * to GeoJSON in a column named geom.
 *
 * @param table The {@link DuckDBTable} to select from.
 * @returns A SQL select list.
 */
export function generateSelectList({ columns, geometryColumn }: DuckDBTable) {
  const nestedProperties = columns
    .filter(({ column_type }) => isNestedType(column_type))
    .map(({ column_name }) => column_name);
  const excludeClause = `(${[geometryColumn, ...nestedProperties].map(quoteIdentifier).join(', ')})`;

  // Join the select list from its parts, so that an empty set of nested
  // properties doesn't leave behind a dangling comma.
  return [
    `* EXCLUDE ${excludeClause}`,
    ...nestedProperties.map(
      (name) => `to_json(${quoteIdentifier(name)}) AS ${quoteIdentifier(name)}`
    ),
    `ST_AsGeoJSON(${quoteIdentifier(geometryColumn)}) AS geom`
  ].join(', ');
}

/**
 * Generate a SQL SELECT query to query all data from a table.
 *
 * @param layerId The id of the table to query.
 * @param table The {@link DuckDBTable} to query.
 * @returns A SQL SELECT statement.
 */
export function generateSelectStatement(layerId: string, table: DuckDBTable) {
  return `SELECT ${generateSelectList(table)} FROM ${layerId};`;
}

/**
 * Quote a column name for use as a SQL identifier.
 *
 * @param name The column name.
 * @returns The double-quoted, escaped identifier.
 */
export function quoteIdentifier(name: string): string {
  return `"${name.replaceAll('"', '""')}"`;
}

/**
 * Describe the columns of a layer's table.
 *
 * @param conn The active DuckDB database connection.
 * @param layerId The id of the layer whose table should be described.
 * @returns The name and DuckDB type of each column.
 */
export async function describeTable(
  conn: AsyncDuckDBConnection,
  layerId: string
): Promise<DuckDBColumn[]> {
  return (await conn.query(`DESCRIBE ${layerId};`))
    .toArray()
    .map((row: { toJSON: () => DuckDBColumn }) => row.toJSON());
}

/**
 * Determine whether a DuckDB type is nested (STRUCT, MAP, UNION, LIST, or
 * ARRAY). Arrow surfaces values of these types as StructRow and MapRow Proxies
 * and Vectors, which cannot be structured-cloned to MapLibre's workers.
 *
 * @param columnType The DuckDB type, as reported by DESCRIBE.
 * @returns Whether the type is nested.
 */
function isNestedType(columnType: string): boolean {
  return /^(STRUCT|MAP|UNION)\(/.test(columnType) || columnType.endsWith(']');
}

/**
 * Inspect a newly-created table for the column storing geometry.
 *
 * @param conn The active DuckDB database connection.
 * @param layerId The id of the layer to inspect.
 * @returns A {@link DuckDBTable}.
 */
async function inspectTableForGeometry(
  conn: AsyncDuckDBConnection,
  layerId: string
): Promise<DuckDBTable> {
  const columns = await describeTable(conn, layerId);
  const geometry = columns.find(({ column_type }) =>
    column_type.startsWith('GEOMETRY')
  );

  if (!geometry) {
    throw new Error('No geometry column found.');
  }

  return {
    columns,
    geometryColumn: geometry.column_name
  };
}

/**
 * Query the geometry type of a DuckDB table using ST_GeometryType:
 * https://duckdb.org/docs/2.0/core_extensions/spatial/functions#st_geometrytype
 *
 * @param conn The active DuckDB database connection.
 * @param layerId The id of the layer to inspect.
 * @param geometryColumn The name of the layer's geometry column.
 * @returns A Promise resolving to an Object containing the geometry_type of the
 * layerId.
 * @throws If no valid geometries can be found.
 */
export async function queryGeometryType(
  conn: AsyncDuckDBConnection,
  layerId: string,
  geometryColumn: string
): Promise<DuckDBGeometryType> {
  const [row] = (
    await conn.query(
      `SELECT ST_GeometryType(${quoteIdentifier(geometryColumn)})::VARCHAR AS geometry_type FROM ${quoteIdentifier(layerId)} WHERE ${geometryColumn} IS NOT NULL LIMIT 1;`
    )
  )
    .toArray()
    .map((row: { toJSON: () => { geometry_type: DuckDBGeometryType } }) =>
      row.toJSON()
    );

  if (!row) {
    throw new Error(
      `Could not find a valid geometry type for layer ${layerId}.`
    );
  }

  return row.geometry_type;
}

interface CreateTableParams {
  db: AsyncDuckDB;
  conn: AsyncDuckDBConnection;
  layerId: string;
  location: Exclude<CartoKitSource, { type: 'pmtiles' }>['location'];
}

/**
 * Create a table for a layer in the local, in-memory DuckDB database.
 *
 * @param params The {@link CreateTableParams}.
 * @param params.db The DuckDB database instance.
 * @param params.conn The active DuckDB database connection.
 * @param params.layerId The id of the layer to create.
 * @param params.location Information on the storage of the layer being added.
 * @returns The newly-created {@link DuckDBTable}.
 */
export async function createTable({
  db,
  conn,
  layerId,
  location
}: CreateTableParams): Promise<DuckDBTable> {
  switch (location.type) {
    case 'api':
      await conn.query(generateCreateTableStatement(layerId, location.url));

      return await inspectTableForGeometry(conn, layerId);
    case 'file':
      await db.registerFileHandle(
        location.file.name,
        location.file,
        DuckDBDataProtocol.BROWSER_FILEREADER,
        true
      );
      await conn.query(
        generateCreateTableStatement(layerId, location.file.name)
      );

      return await inspectTableForGeometry(conn, layerId);
    case 'table': {
      const table = await inspectTableForGeometry(conn, location.parentLayerId);
      await conn.query(
        generateCreateDerivedTableStatement(
          layerId,
          location,
          table.geometryColumn
        )
      );

      return table;
    }
  }
}

/**
 * Read a given layer's data from the DuckDB database as GeoJSON. Nested
 * columns are serialized to JSON by DuckDB and parsed back into plain objects,
 * so that every property can be structured-cloned to MapLibre's workers.
 *
 * @param conn The active DuckDB database connection.
 * @param layerId The id of the layer to create.
 * @param table The layer's {@link DuckDBTable}.
 * @returns A GeoJSON {@link FeatureCollection}.
 */
export async function readTableAsGeoJSON(
  conn: AsyncDuckDBConnection,
  layerId: string,
  table: DuckDBTable
): Promise<FeatureCollection> {
  const query = generateSelectStatement(layerId, table);

  return toFeatureCollection(await conn.query(query));
}

/**
 * Convert the results of a query to a GeoJSON {@link FeatureCollection}. The
 * query must select each feature's geometry as GeoJSON in a column named geom;
 * all other columns become feature properties.
 *
 * @param results The results of a DuckDB query.
 * @returns A GeoJSON {@link FeatureCollection}.
 */
export function toFeatureCollection(
  results: Pick<Awaited<ReturnType<AsyncDuckDBConnection['query']>>, 'toArray'>
): FeatureCollection {
  const features = results
    .toArray()
    .map((row: { toJSON: () => { geom: string; [key: string]: unknown } }) => {
      const { geom, ...properties } = row.toJSON();

      return {
        type: 'Feature',
        properties,
        geometry: JSON.parse(geom)
      } as Feature;
    });

  return {
    type: 'FeatureCollection',
    features
  };
}
