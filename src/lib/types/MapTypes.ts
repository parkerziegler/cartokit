export const MAP_TYPES = ['Fill', 'Choropleth', 'Proportional Symbol'] as const;
export type MapType = (typeof MAP_TYPES)[number];
