import type { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
import type { Geometry } from 'geojson';

import { quoteIdentifier } from '$lib/utils/db';

// A map of the geometry types reported by DuckDB's ST_GeometryType to GeoJSON
// Geometry types.
const DUCKDB_GEOMETRY_TYPES_TO_GEOJSON_GEOMETRY_TYPES: Record<
  string,
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
 * @returns The {@link Geometry['type']} of the GeoParquet file.
 */
export async function getGeoParquetGeometryType(
  conn: AsyncDuckDBConnection,
  source: string,
  layerId: string
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

  const [row] = (
    await conn.query(
      `SELECT ST_GeometryType(geom)::VARCHAR AS geometry_type FROM ${quoteIdentifier(layerId)} WHERE geom IS NOT NULL LIMIT 1;`
    )
  )
    .toArray()
    .map((row: { toJSON: () => { geometry_type: string } }) => row.toJSON());

  if (!row) {
    throw new Error('No geometries found.');
  }

  return DUCKDB_GEOMETRY_TYPES_TO_GEOJSON_GEOMETRY_TYPES[row.geometry_type];
}
