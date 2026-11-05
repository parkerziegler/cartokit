import type { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
import type { Geometry } from 'geojson';

import { queryGeometryType, quoteIdentifier } from '$lib/utils/db';
import { DUCKDB_GEOMETRY_TYPES_TO_SIMPLE_FEATURES_GEOMETRY_TYPES } from '$lib/utils/sf';
import { snakeCase } from 'lodash-es';

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
  const geometryType = await queryGeometryType(
    conn,
    layerId,
    quoteIdentifier(geometryColumn)
  );

  return DUCKDB_GEOMETRY_TYPES_TO_SIMPLE_FEATURES_GEOMETRY_TYPES[geometryType];
}

/**
 * Copy a table in DuckDB to a GeoJSON Blob.
 *
 * @param db The active DuckDB database instance.
 * @param conn The active DuckDB database connection.
 * @param layerId The id of the layer to query for data.
 * @param displayName The display name of the layer, used to generate a file
 * name for use in DuckDB's virtual file system.
 * @returns A Promise resolving to a Blob containing the GeoJSON data, as bytes.
 */
export async function copyTableToGeoJSON(
  db: AsyncDuckDB,
  conn: AsyncDuckDBConnection,
  layerId: string,
  displayName: string
): Promise<Blob> {
  const fileName = `${snakeCase(displayName)}.json`;
  await conn.query(`COPY (SELECT * FROM ${quoteIdentifier(layerId)};)
TO ${quoteIdentifier(fileName)}
WITH (FORMAT GDAL, Driver 'GeoJSON');`);

  const geojsonBytes = (await db.copyFileToBuffer(
    fileName
  )) as Uint8Array<ArrayBuffer>;
  const blob = new Blob([geojsonBytes], { type: 'application/geo+json' });

  return blob;
}
