import type { Geometry } from 'geojson';
import type { Map as MapLibreGLMap } from 'maplibre-gl';

import type { LayerType } from '#lib/types/index.ts';
import type { VectorGeometry } from '#lib/types/source.ts';

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
 * @param map The top-level {@link MapLibreGLMap} instance.
 * @param layerId The id of the {@link CartoKitLayer}.
 * @returns An array of affiliated layer ids, in draw order.
 */
export function getAffiliatedLayerIds(
  map: MapLibreGLMap,
  layerId: string
): string[] {
  return map
    .getLayersOrder()
    .filter((id) =>
      isAffiliatedLayer(layerId, { id, source: map.getLayer(id)?.source })
    );
}

/**
 * Get the canonical layerId for a {@link CartoKitLayer}.
 *
 * @param layerId The id of the {@link CartoKitLayer} to canonicalize.
 * @returns The canonical layerId, with any suffixes (e.g. "-points") removed.
 */
export function getCanonicalLayerId(layerId: string) {
  return layerId.replace(/-points/g, '');
}

/**
 * Get the instrumented layerId for a {@link CartoKitLayer}.
 *
 * @param layerId The canonical layerId of the {@link CartoKitLayer}.
 * @param layerType The {@link LayerType} of the {@link CartoKitLayer}.
 * @returns The instrumented layerId.
 */
export function getInstrumentedLayerId(layerId: string, layerType: LayerType) {
  if (layerType === 'Heatmap' && !layerId.endsWith('-points')) {
    return `${layerId}-points`;
  }

  return layerId;
}

/**
 * Get the id of the source backing a layer on the map.
 *
 * @param map The top-level {@link Map} instance.
 * @param layerId The id of the layer to look up.
 * @returns The id of the source backing the layer.
 */
export function getSourceId(map: MapLibreGLMap, layerId: string) {
  return map.getLayer(layerId)?.source ?? layerId;
}

export const SIMPLE_FEATURES_GEOMETRY_TYPES_TO_LAYER_TYPES = new Map<
  Geometry['type'],
  LayerType[]
>([
  ['Point', ['Point', 'Proportional Symbol', 'Heatmap']],
  ['MultiPoint', ['Point', 'Proportional Symbol', 'Heatmap']],
  ['LineString', ['Line']],
  ['MultiLineString', ['Line']],
  ['Polygon', ['Polygon', 'Choropleth']],
  ['MultiPolygon', ['Polygon', 'Choropleth']],
  ['GeometryCollection', []]
]);

export const PMTILES_GEOMETRY_TYPES_TO_LAYER_TYPES = new Map<
  VectorGeometry,
  LayerType[]
>([
  ['Point', ['Point', 'Proportional Symbol', 'Heatmap']],
  ['Line', ['Line']],
  ['Polygon', ['Polygon', 'Choropleth']]
]);
