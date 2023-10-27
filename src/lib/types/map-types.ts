import type { Geometry } from 'geojson';

export const MAP_TYPES = [
  'Point',
  'Line',
  'Fill',
  'Choropleth',
  'Proportional Symbol',
  'Dot Density'
] as const;
export type MapType = (typeof MAP_TYPES)[number];

export const GEOMETRY_TO_MAP_TYPES: Record<Geometry['type'], MapType[]> = {
  Point: ['Point', 'Proportional Symbol'],
  MultiPoint: ['Point', 'Proportional Symbol'],
  LineString: ['Line'],
  MultiLineString: ['Line'],
  Polygon: [
    'Fill',
    'Choropleth',
    'Point',
    'Proportional Symbol',
    'Dot Density'
  ],
  MultiPolygon: [
    'Fill',
    'Choropleth',
    'Point',
    'Proportional Symbol',
    'Dot Density'
  ],
  GeometryCollection: []
};
