import type { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
import type { Geometry } from 'geojson';
import { snakeCase } from 'lodash-es';

import type { DuckDBGeometryType } from '$lib/types/db';
import { queryGeometryType, quoteIdentifier } from '$lib/utils/db';

// A map of the geometry types reported by DuckDB's ST_GeometryType to GeoJSON
// Geometry types.
const DUCKDB_GEOMETRY_TYPES_TO_GEOJSON_GEOMETRY_TYPES: Record<
  DuckDBGeometryType,
  Geometry['type']
> = {
  POINT: 'Point',
  MULTIPOINT: 'MultiPoint',
  LINESTRING: 'LineString',
  MULTILINESTRING: 'MultiLineString',
  POLYGON: 'Polygon',
  MULTIPOLYGON: 'MultiPolygon',
  GEOMETRYCOLLECTION: 'GeometryCollection'
};

/**
 * Get the {@link Geometry['type']} of a GeoParquet file from the geometry_types
 * recorded for its primary geometry column in the file's geo metadata. The
 * GeoParquet spec permits geometry_types to be empty, in which case we fall
 * back to the type of the first non-null geometry in the layer's table.
 *
 * @param conn The active DuckDB database connection.
 * @param source The URL or registered file name of the GeoParquet file.
 * @param layerId The id of the layer whose table holds the file's data.
 * @param geometryColumn The name of the geometry column in the layer's table.
 * @returns The {@link Geometry['type']} of the GeoParquet file.
 */
export async function getGeoParquetGeometryType(
  conn: AsyncDuckDBConnection,
  source: string,
  layerId: string,
  geometryColumn: string
): Promise<Geometry['type']> {
  const [metadata] = (
    await conn.query(
      `WITH metadata AS (
  SELECT decode(value)::JSON AS geo
  FROM parquet_kv_metadata('${source.replaceAll("'", "''")}')
  WHERE key = 'geo'
)
SELECT split_part(
  geo -> 'columns' -> (geo ->> 'primary_column') -> 'geometry_types' ->> 0,
  ' ',
  1
) AS geometry_type
FROM metadata;`
    )
  )
    .toArray()
    .map((row: { toJSON: () => { geometry_type: string | null } }) =>
      row.toJSON()
    );

  if (metadata?.geometry_type) {
    return metadata.geometry_type as Geometry['type'];
  }

  const geometryType = await queryGeometryType(
    conn,
    layerId,
    quoteIdentifier(geometryColumn)
  );

  return DUCKDB_GEOMETRY_TYPES_TO_GEOJSON_GEOMETRY_TYPES[geometryType];
}

/**
 * Copy a table in DuckDB to a GeoParquet Blob.
 *
 * @param db The active DuckDB database instance.
 * @param conn The active DuckDB database connection.
 * @param layerId The id of the layer to query for data.
 * @param displayName The display name of the layer, used to generate a file
 * name for use in DuckDB's virtual file system.
 * @returns A Promise resolving to a Blob containing the GeoParquet data, as bytes.
 */
export async function copyTableToGeoParquet(
  db: AsyncDuckDB,
  conn: AsyncDuckDBConnection,
  layerId: string,
  displayName: string
): Promise<Blob> {
  const fileName = `${snakeCase(displayName)}.parquet`;
  await conn.query(`COPY (SELECT * FROM ${quoteIdentifier(layerId)};)
TO ${quoteIdentifier(fileName)}
(FORMAT PARQUET, COMPRESSION ZSTD);`);

  const geoparquetBytes = (await db.copyFileToBuffer(
    fileName
  )) as Uint8Array<ArrayBuffer>;
  const blob = new Blob([geoparquetBytes], {
    type: 'application/octet-stream'
  });

  return blob;
}
