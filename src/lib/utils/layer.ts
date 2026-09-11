import type { Geometry } from 'geojson';
import type maplibregl from 'maplibre-gl';

import type { LayerType, VectorGeometry } from '$lib/types';

/**
 * Determine whether a map layer id is affiliated with an existing
 * {@link CartoKitLayer}.
 *
 * @param layerId The id of the {@link CartoKitLayer}.
 * @param id The layer or source id to test.
 * @returns Whether the id belongs to the {@link CartoKitLayer}.
 */
export function isAffiliatedId(layerId: string, id: string): boolean {
  return id === layerId || id.startsWith(`${layerId}-`);
}

/**
 * Determine whether a layer belongs to a {@link CartoKitLayer}.
 *
 * Affiliation by id alone is enough to identify every layer cartokit draws,
 * but it cannot distinguish them from a basemap layer that happens to be named
 * like one. Require the layer to draw from an affiliated source as well.
 *
 * @param layerId The id of the {@link CartoKitLayer}.
 * @param layer The layer to test, from the map or from a style specification.
 * @returns Whether the layer belongs to the {@link CartoKitLayer}.
 */
export function isAffiliatedLayer(
  layerId: string,
  layer: { id: string; source?: string }
): boolean {
  return (
    isAffiliatedId(layerId, layer.id) &&
    layer.source !== undefined &&
    isAffiliatedId(layerId, layer.source)
  );
}

/**
 * Get the ids of all layers on the map belonging to a {@link CartoKitLayer},
 * including the layer's own id.
 *
 * @param map The top-level {@link maplibregl.Map} instance.
 * @param layerId The id of the {@link CartoKitLayer}.
 * @returns An array of affiliated layer ids, in draw order.
 */
export function getAffiliatedLayerIds(
  map: maplibregl.Map,
  layerId: string
): string[] {
  return map
    .getLayersOrder()
    .filter((id) =>
      isAffiliatedLayer(layerId, { id, source: map.getLayer(id)?.source })
    );
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

export const VECTOR_GEOMETRY_TYPES_TO_LAYER_TYPES = new Map<
  VectorGeometry,
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
