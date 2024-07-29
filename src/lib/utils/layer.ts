import type { Geometry } from 'geojson';

import type { CartoKitLayer, LayerType } from '$lib/types';

/**
 * Get the layer ids for all instrumented layers associated with a given layer.
 *
 * @param layer — The @see{CartoKitLayer} that the instrumented layers are associated with.
 *
 * @returns – An array of instrumented layer ids.
 */
export function getInstrumentedLayerIds(layer: CartoKitLayer): string[] {
  switch (layer.type) {
    case 'Point':
    case 'Proportional Symbol':
    case 'Line':
      return [`${layer.id}-hover`, `${layer.id}-select`];
    case 'Dot Density':
      return [
        `${layer.id}-outlines`,
        `${layer.id}-outlines-hover`,
        `${layer.id}-outlines-select`
      ];
    case 'Polygon':
    case 'Choropleth':
      return [`${layer.id}-stroke`, `${layer.id}-hover`, `${layer.id}-select`];
  }
}

// A map of GeoJSON Geometry types to the supported cartokit layer types.
export const geometryToLayerTypes = new Map<Geometry['type'], LayerType[]>([
  ['Point', ['Point', 'Proportional Symbol']],
  ['MultiPoint', ['Point', 'Proportional Symbol']],
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
