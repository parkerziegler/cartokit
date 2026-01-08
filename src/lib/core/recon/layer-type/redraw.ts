import type { Map, GeoJSONSource } from 'maplibre-gl';

import { addLayer } from '$lib/interaction/layer';
import { listeners, type LayerListeners } from '$lib/state/listeners.svelte';
import type { CartoKitLayer } from '$lib/types';
import { getInstrumentedLayerIds } from '$lib/utils/layer';

/**
 * Redraw a layer on the map given the source and target layer definitions.
 *
 * @param map The MapLibre GL map instance.
 * @param sourceLayer The {@link CartoKitLayer} to remove.
 * @param targetLayer The {@link CartoKitLayer} to add.
 */
export function redraw(
  map: Map,
  sourceLayer: CartoKitLayer,
  targetLayer: CartoKitLayer
) {
  // Remove all event listeners for the existing layer.
  if (listeners.value.has(sourceLayer.id)) {
    Object.entries(listeners.value.get(sourceLayer.id)!).forEach(
      ([event, listener]) => {
        map.off(event as keyof LayerListeners, sourceLayer.id, listener);
      }
    );

    listeners.value.delete(sourceLayer.id);
  }

  // Remove the existing layer and all instrumented layers.
  map.removeLayer(sourceLayer.id);

  getInstrumentedLayerIds(sourceLayer).forEach((id) => {
    if (map.getLayer(id)) {
      map.removeLayer(id);
    }
  });

  // Update the source with the new data.
  (map.getSource(sourceLayer.id) as GeoJSONSource).setData(
    targetLayer.data.geojson
  );

  // Add the new layer. This function call includes instrumentation.
  addLayer(map, targetLayer);
}
