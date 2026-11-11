import type { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
import type { Geometry } from 'geojson';
import { snakeCase } from 'lodash-es';

import type { DuckDBTable } from '$lib/types/db';
import { queryGeometryType, quoteIdentifier } from '$lib/utils/db';
import { DUCKDB_GEOMETRY_TYPES_TO_SIMPLE_FEATURES_GEOMETRY_TYPES } from '$lib/utils/sf';

/**
 * Get the {@link Geometry['type']} of a GeoJSON layer.
 *
 * @param conn The active DuckDB database connection.
 * @param layerId The id of the layer whose table holds the file's data.
 * @param geometryColumn The name of the geometry column in the layer's table.
 * @returns A Promise resolving to the {@link Geometry['type']} of the GeoJSON
 * file.
 */
export async function getGeoJSONGeometryType(
  conn: AsyncDuckDBConnection,
  layerId: string,
  geometryColumn: string
): Promise<Geometry['type']> {
  const geometryType = await queryGeometryType(conn, layerId, geometryColumn);

  return DUCKDB_GEOMETRY_TYPES_TO_SIMPLE_FEATURES_GEOMETRY_TYPES[geometryType];
}

// The feature id column ST_Read adds to tables read through GDAL.
const OGC_FID = 'OGC_FID';

interface CopyTableToGeoJSONParams {
  db: AsyncDuckDB;
  conn: AsyncDuckDBConnection;
  layerId: string;
  displayName: string;
  table: DuckDBTable;
}

/**
 * Copy a table in DuckDB to a GeoJSON Blob.
 *
 * Build the FeatureCollection in SQL and write it with DuckDB's own JSON
 * writer rather than COPY ... (FORMAT GDAL). GDAL writes through its own file
 * layer, which can't write to DuckDB-wasm's virtual file system, so GDAL COPY
 * fails with "Cannot write feature" for every input:
 * https://github.com/duckdb/duckdb-wasm/issues/1840
 *
 * @param params The {@link CopyTableToGeoJSONParams}.
 * @param params.db The active DuckDB database instance.
 * @param params.conn The active DuckDB database connection.
 * @param params.layerId The id of the layer to query for data.
 * @param params.displayName The display name of the layer, used to generate a
 * file name for use in DuckDB's virtual file system.
 * @param params.table The layer's {@link DuckDBTable}.
 * @returns A Promise resolving to a Blob containing the GeoJSON data, as bytes.
 */
export async function copyTableToGeoJSON({
  db,
  conn,
  layerId,
  displayName,
  table: { columns, geometryColumn }
}: CopyTableToGeoJSONParams): Promise<Blob> {
  const fileName = `${snakeCase(displayName)}.json`;
  const geometry = quoteIdentifier(geometryColumn);

  // ST_Read adds an OGC_FID column holding each feature's id. Write it as the
  // feature's top-level id, as GDAL does, rather than as a property; otherwise,
  // reading the file back with ST_Read yields a duplicate OGC_FID column.
  const hasFID = columns.some(({ column_name }) => column_name === OGC_FID);
  const excluded = [geometry, ...(hasFID ? [quoteIdentifier(OGC_FID)] : [])];

  await conn.query(`COPY (
  SELECT 'FeatureCollection' AS type,
    list({
      'type': 'Feature',${hasFID ? `\n      'id': ${quoteIdentifier(OGC_FID)},` : ''}
      'properties': struct_pack(*COLUMNS(* EXCLUDE (${excluded.join(', ')}))),
      'geometry': ST_AsGeoJSON(${geometry})::JSON
    }) AS features
  FROM ${quoteIdentifier(layerId)}
)
TO ${quoteIdentifier(fileName)}
(FORMAT JSON);`);

  const geojsonBytes = (await db.copyFileToBuffer(
    fileName
  )) as Uint8Array<ArrayBuffer>;
  const blob = new Blob([geojsonBytes], { type: 'application/geo+json' });

  return blob;
}
