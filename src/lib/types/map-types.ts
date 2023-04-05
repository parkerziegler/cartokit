export const MAP_TYPES = [
  'Fill',
  'Choropleth',
  'Proportional Symbol',
  'Dot Density'
] as const;
export type MapType = (typeof MAP_TYPES)[number];
