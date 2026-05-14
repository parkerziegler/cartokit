import type { Geometry } from 'geojson';

import type { LayerType, VectorTileGeometry } from '$lib/types';

/**
 * Get the layer ids for all instrumented layers associated with a given layer.
 *
 * @param layerId The id of the layer that the instrumented layers are
 * associated with.
 * @param layerType The {@link LayerType} of the layer that the instrumented
 * layers are associated with.
 * @returns An array of instrumented layer ids.
 */
export function getInstrumentedLayerIds(
  layerId: string,
  layerType: LayerType
): string[] {
  switch (layerType) {
    case 'Point':
    case 'Proportional Symbol':
    case 'Line':
    case 'Heatmap':
      return [
        `${layerId}-points`,
        `${layerId}-points-hover`,
        `${layerId}-points-select`
      ];
    case 'Dot Density':
      return [
        `${layerId}-outlines`,
        `${layerId}-outlines-hover`,
        `${layerId}-outlines-select`
      ];
    case 'Polygon':
    case 'Choropleth':
      return [`${layerId}-stroke`, `${layerId}-hover`, `${layerId}-select`];
  }
}

// A map of GeoJSON Geometry types to the supported cartokit layer types.
export const GEOJSON_GEOMETRY_TYPES_TO_LAYER_TYPES = new Map<
  Geometry['type'],
  LayerType[]
>([
  ['Point', ['Point', 'Proportional Symbol', 'Heatmap']],
  ['MultiPoint', ['Point', 'Proportional Symbol', 'Heatmap']],
  ['LineString', ['Line', 'Point', 'Proportional Symbol']],
  ['MultiLineString', ['Line', 'Point', 'Proportional Symbol']],
  [
    'Polygon',
    ['Polygon', 'Choropleth', 'Point', 'Proportional Symbol', 'Dot Density']
  ],
  [
    'MultiPolygon',
    ['Polygon', 'Choropleth', 'Point', 'Proportional Symbol', 'Dot Density']
  ],
  ['GeometryCollection', []]
]);

export const VECTOR_TILE_GEOMETRY_TYPES_TO_LAYER_TYPES = new Map<
  VectorTileGeometry,
  LayerType[]
>([
  ['Point', ['Point', 'Proportional Symbol', 'Heatmap']],
  ['Line', ['Line']],
  ['Polygon', ['Polygon', 'Choropleth']]
]);

// A set of valid GeoJSON Geometry types for cartokit layers.
export const VALID_GEOJSON_TYPES = new Set([
  ...GEOJSON_GEOMETRY_TYPES_TO_LAYER_TYPES.keys(),
  'Feature',
  'FeatureCollection'
]);
