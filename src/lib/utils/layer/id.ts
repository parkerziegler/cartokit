import type maplibregl from 'maplibre-gl';

/**
 * Get the canonical layerId for a {@link CartoKitLayer}.
 *
 * @param layerId The id of the {@link CartoKitLayer} to canonicalize.
 * @returns The canonical layerId, with any suffixes (e.g. "-outlines", "-points") removed.
 */
export function getCanonicalLayerId(layerId: string): string {
  return layerId.replace(/-outlines|-points/g, '');
}

/**
 * Get the id of the source backing a layer on the map.
 *
 * @param map The top-level {@link maplibregl.Map} instance.
 * @param layerId The id of the layer to look up.
 * @returns The id of the source backing the layer.
 */
export function getSourceId(map: maplibregl.Map, layerId: string): string {
  return map.getLayer(layerId)?.source ?? layerId;
}
