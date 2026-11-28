import {
  AsyncDuckDB,
  type AsyncDuckDBConnection,
  ConsoleLogger,
  DuckDBDataProtocol,
  getJsDelivrBundles,
  selectBundle
} from '@duckdb/duckdb-wasm';
import type { Feature, FeatureCollection } from 'geojson';
import { duckdb, formatDialect } from 'sql-formatter';

import type {
  DuckDBColumn,
  DuckDBGeometryType,
  DuckDBTable
} from '#lib/types/db.ts';
import type { CartoKitSource, CartoKitTableSource } from '#lib/types/source.ts';
import type { Transformation } from '#lib/types/transformation.ts';
import { inferCRS } from '#lib/utils/crs.ts';
import { padBoundsForTransformation } from '#lib/utils/transformation.ts';

const DUCKDB_BUNDLES = getJsDelivrBundles();

/**
 * Initialize a DuckDB in-memory database.
 *
 * @returns An Object continaing:
 *  1. The initialized {@link AsyncDuckDB} instance.
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

  // Instantiate the asynchronous version of DuckDB-Wasm.
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
LOAD spatial;

${inferCRS()}`);

  return { db, worker, conn };
}

/**
 * Generate a SQL CREATE TABLE statement for a given layerId and data source.
 *
 * @param layerId The layerId to use as the table name.
 * @param source The data source, either a
 * @returns A SQL CREATE TABLE statement.
 */
export function generateCreateTableStatement(
  layerId: string,
  source: string
): string {
  const reader = /\.(geo)?parquet$/.test(source) ? `read_parquet` : `ST_Read`;

  const query = `
  CREATE TABLE ${layerId} AS
  SELECT * FROM ${reader}('${source}');
  `;

  return query;
}

/**
 * Generate a SQL CREATE TABLE statement for a layer derived from another
 * layer's table, replacing the parent's geometry with its transformed geometry.
 *
 * @param layerId The layerId to use as the table name.
 * @param location The location of the {@link CartoKitTableSource}.
 * @param geometryColumn The name of the parent table's geometry column.
 * @returns A SQL CREATE TABLE statement.
 */
export function generateCreateDerivedTableStatement(
  layerId: string,
  { parentLayerId, transformation }: CartoKitTableSource['location'],
  geometryColumn: string
): string {
  const query = `
  CREATE TABLE ${layerId} AS
  SELECT * REPLACE (${generateTransformationExpression(transformation, geometryColumn)} AS ${quoteIdentifier(geometryColumn)})
  FROM ${parentLayerId};
  `;

  return query;
}

/**
 * Generate the SQL expression that applies a {@link Transformation} to a
 * geometry column.
 *
 * The call to ST_MakeValid is an attempt to repair invalid geometries (e.g.,
 * zero-width spikes) before buffering — GEOS' buffer overlay can throw a
 * TopologyException on such geometries.
 *
 * @param transformation The {@link Transformation} to apply.
 * @param geometryColumn The name of the geometry column to transform.
 * @returns A SQL expression evaluating to the transformed geometry.
 */
export function generateTransformationExpression(
  transformation: Transformation,
  geometryColumn: string
): string {
  const geom = quoteIdentifier(geometryColumn);
  const inferCRSExpression = `infer_crs(${geom})`;
  let query = '';

  switch (transformation.type) {
    case 'Buffer':
      query = `ST_Transform(
        ST_Buffer(
          ST_Transform(
            ST_CollectionExtract(ST_MakeValid(${geom})),
            'EPSG:4326',
            ${inferCRSExpression},
            always_xy := true
          ),
          ${transformation.args.distance}
        ),
        ${inferCRSExpression},
        'EPSG:4326',
        always_xy := true
      )`;
      break;
    case 'Centroid':
      query = `ST_Transform(
        ST_Centroid(
          ST_Transform(
            ${geom},
            'EPSG:4326',
            ${inferCRSExpression},
            always_xy := true
          )
        ),
        ${inferCRSExpression},
        'EPSG:4326',
        always_xy := true
      )`;
      break;
    case 'Envelope':
      query = `ST_Transform(
        ST_Envelope(
          ST_Transform(
            ${geom},
            'EPSG:4326',
            ${inferCRSExpression},
            always_xy := true
          )
        ),
        ${inferCRSExpression},
        'EPSG:4326',
        always_xy := true
      )`;
      break;
  }

  return query;
}

/** The column alias carrying each feature's stable id for GeoJSON reads. */
export const FEATURE_ID_COLUMN = '__cartokit_id';

interface GenerateSelectStatementParams {
  layerId: string;
  table: DuckDBTable;
  geometryExpression: string;
  includeFeatureId?: boolean;
}

/**
 * Generate the SELECT statement for reading a table's rows as GeoJSON.
 *
 * @param params The {@link GenerateSelectStatementParams}.
 * @param params.layerId The id of the layer being queried.
 * @param params.table The {@link DuckDBTable} being queried.
 * @param params.geometryExpression A SQL expression evaluating to each row's
 * geometry.
 * @param params.includeFeatureId Whether to select each row's rowid as its
 * feature id, aliased as {@link FEATURE_ID_COLUMN}. Defaults to false.
 * @returns A SQL SELECT statement.
 */
export function generateSelectStatement({
  layerId,
  table: { columns, geometryColumn },
  geometryExpression,
  includeFeatureId = false
}: GenerateSelectStatementParams): string {
  const nestedColumns = columns.flatMap(({ column_type, column_name }) => {
    if (
      /^(STRUCT|MAP|UNION)\(/.test(column_type) ||
      column_type.endsWith(']')
    ) {
      return [column_name];
    }

    return [];
  });
  const excludedColumns = [geometryColumn, ...nestedColumns]
    .map(quoteIdentifier)
    .join(', ');
  const serializedColumns = [
    ...nestedColumns.map(
      (column_name) =>
        `to_json(${quoteIdentifier(column_name)}) AS ${quoteIdentifier(column_name)}`
    ),
    `ST_AsGeoJSON(${geometryExpression}) AS geom`,
    ...(includeFeatureId
      ? [`rowid::INTEGER AS ${quoteIdentifier(FEATURE_ID_COLUMN)}`]
      : [])
  ].join(', ');

  return `SELECT * EXCLUDE(${excludedColumns}), ${serializedColumns} FROM ${layerId}`;
}

interface GenerateViewportTransformationQueryParams {
  parentLayerId: string;
  transformation: Transformation;
  table: DuckDBTable;
  bounds: [number, number, number, number];
}

/**
 * Generate a query that applies a {@link Transformation} to the features of a
 * parent table intersecting the viewport, selected as GeoJSON.
 *
 * @param params The {@link GenerateViewportTransformationQueryParams}.
 * @param params.parentLayerId The id of the parent layer to transform.
 * @param params.transformation The {@link Transformation} to apply.
 * @param params.table The parent layer's {@link DuckDBTable}.
 * @param params.bounds The viewport bounds, as [west, south, east, north].
 * @returns A SQL SELECT statement.
 */
export function generateViewportTransformationQuery({
  parentLayerId,
  transformation,
  table,
  bounds
}: GenerateViewportTransformationQueryParams): string {
  const [west, south, east, north] = padBoundsForTransformation(
    transformation,
    bounds
  );

  return `
  ${generateSelectStatement({
    layerId: parentLayerId,
    table,
    geometryExpression: generateTransformationExpression(
      transformation,
      table.geometryColumn
    ),
    includeFeatureId: true
  })}
  WHERE ST_Intersects(
    ${quoteIdentifier(table.geometryColumn)},
    ST_MakeEnvelope(${west}, ${south}, ${east}, ${north})
  );`;
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
    await conn.query(`
      SELECT ST_GeometryType(${quoteIdentifier(geometryColumn)})::VARCHAR AS geometry_type
      FROM ${quoteIdentifier(layerId)}
      WHERE ${geometryColumn} IS NOT NULL
      LIMIT 1;
    `)
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

/**
 * Format a SQL query for display.
 *
 * @param query The SQL query to format.
 * @returns The formatted SQL query.
 */
export function formatSQL(query: string): string {
  const dialect = {
    ...duckdb,
    tokenizerOptions: {
      ...duckdb.tokenizerOptions,
      reservedFunctionNames: [
        ...duckdb.tokenizerOptions.reservedFunctionNames,
        'infer_crs',
        'ST_AsGeoJSON',
        'ST_Buffer',
        'ST_Centroid',
        'ST_CollectionExtract',
        'ST_Envelope',
        'ST_MakeValid',
        'ST_Read',
        'ST_Transform'
      ]
    }
  };

  return formatDialect(query, {
    dialect,
    keywordCase: 'upper'
  });
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
  const query = generateSelectStatement({
    layerId,
    table,
    geometryExpression: quoteIdentifier(table.geometryColumn),
    includeFeatureId: true
  });

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
      const { geom, [FEATURE_ID_COLUMN]: id, ...properties } = row.toJSON();

      return {
        type: 'Feature',
        ...(id !== undefined && { id: id as number }),
        properties,
        geometry: JSON.parse(geom)
      } as Feature;
    });

  return {
    type: 'FeatureCollection',
    features
  };
}

let previewController = new AbortController();
let previewQueue: Promise<unknown> = Promise.resolve();

/**
 * Run a preview query (e.g., speculation, drag previews) and read its results
 * as GeoJSON. Only the latest preview's results are returned; superseded
 * previews resolve to null.
 *
 * @param conn The active {@link AsyncDuckDBConnection}.
 * @param query The preview SQL query to run.
 * @returns The query results as a {@link FeatureCollection}, or null if the
 * preview was superseded or invalidated.
 */
export function runPreviewQuery(
  conn: AsyncDuckDBConnection,
  query: string
): Promise<FeatureCollection | null> {
  previewController.abort();
  previewController = new AbortController();
  const { signal } = previewController;
  void conn.cancelSent();

  const preview = previewQueue
    .then(async () => {
      if (signal.aborted) {
        return null;
      }

      const batches = await (await conn.send(query)).readAll();

      return signal.aborted
        ? null
        : ({
            type: 'FeatureCollection',
            features: batches.flatMap(
              (batch) => toFeatureCollection(batch).features
            )
          } satisfies FeatureCollection);
    })
    .catch(() => null);

  previewQueue = preview;

  return preview;
}

/**
 * Invalidate all in-flight preview queries, so their results are discarded,
 * and wait for the queue of previews to settle.
 *
 * @param conn The active {@link AsyncDuckDBConnection}.
 */
export async function invalidatePreviewQueries(
  conn: AsyncDuckDBConnection
): Promise<void> {
  previewController.abort();
  void conn.cancelSent();

  await previewQueue;
}
