import {
  AsyncDuckDB,
  type AsyncDuckDBConnection,
  ConsoleLogger,
  DuckDBDataProtocol
} from '@duckdb/duckdb-wasm';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import type { Feature, FeatureCollection } from 'geojson';

import type { DuckDBColumn, DuckDBTable } from '$lib/types/db';

/**
 * Initialize a DuckDB in-memory database.
 *
 * @returns An Object continaing:
 *  1. The initialized {@link AsyncDuckDB} instance
 *  2. A reference to the {@link Worker} thread running the instance.
 *  3. The active {@link AsyncDuckDBConnection}.
 */
export async function initDB() {
  // Instantiate the asynchronous version of DuckDB-wasm
  const worker = new Worker(eh_worker);
  const logger = new ConsoleLogger();
  const db = new AsyncDuckDB(logger, worker);
  await db.instantiate(duckdb_wasm_eh);

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
  return `SELECT ${generateSelectList(table)} FROM ${layerId}`;
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
 * @param layerId The id of the layer whose table should be normalized.
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
 * Create a table for a layer in the local, in-memory DuckDB database.
 *
 * @param db The DuckDB database instance.
 * @param conn The active DuckDB database connection.
 * @param layerId The id of the layer to create.
 * @param location Information on the storage of the layer being added.
 * @returns The newly-created {@link DuckDBTable}.
 */
export async function createTable(
  db: AsyncDuckDB,
  conn: AsyncDuckDBConnection,
  layerId: string,
  location: { type: 'api'; url: string } | { type: 'file'; file: File }
): Promise<DuckDBTable> {
  let source: string;

  if (location.type === 'api') {
    source = location.url;
  } else {
    await db.registerFileHandle(
      location.file.name,
      location.file,
      DuckDBDataProtocol.BROWSER_FILEREADER,
      true
    );
    source = location.file.name;
  }

  await conn.query(generateCreateTableStatement(layerId, source));

  return await inspectTableForGeometry(conn, layerId);
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
  results: Awaited<ReturnType<AsyncDuckDBConnection['query']>>
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
