export const MAP_TYPES = ['Fill', 'Choropleth'] as const;
export type MapType = (typeof MAP_TYPES)[number];
