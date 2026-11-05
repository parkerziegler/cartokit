import type { Geometry } from 'geojson';

import type { DuckDBGeometryType } from '$lib/types/db';

export const DUCKDB_GEOMETRY_TYPES_TO_SIMPLE_FEATURES_GEOMETRY_TYPES: Record<
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
