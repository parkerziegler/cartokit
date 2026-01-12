import type * as maplibregl from 'maplibre-gl';

import { addLayer } from '$lib/interaction/layer';
import { listeners, type LayerListeners } from '$lib/state/listeners.svelte';
import type { CartoKitLayer, LayerType } from '$lib/types';
import { getInstrumentedLayerIds } from '$lib/utils/layer';

interface RedrawParams {
  map: maplibregl.Map;
  sourceLayerId: string;
  sourceLayerType: LayerType;
  targetLayer: CartoKitLayer;
}

/**
 * Redraw a layer on the map given the source and target layer definitions.
 *
 * @param params A promise that resolves to the {@link RedrawParams}, including
 * the MapLibre GL map instance, the id of the source layer, the type of the
 * source layer, and the definition of the target layer.
 */
export function redraw(params: RedrawParams): void {
  const { map, sourceLayerId, sourceLayerType, targetLayer } = params;

  // Remove all event listeners for the existing layer.
  if (listeners.value.has(sourceLayerId)) {
    Object.entries(listeners.value.get(sourceLayerId)!).forEach(
      ([event, listener]) => {
        map.off(event as keyof LayerListeners, sourceLayerId, listener);
      }
    );

    listeners.value.delete(sourceLayerId);
  }

  // Remove the existing layer and all instrumented layers.
  map.removeLayer(sourceLayerId);

  getInstrumentedLayerIds(sourceLayerId, sourceLayerType).forEach((id) => {
    if (map.getLayer(id)) {
      map.removeLayer(id);
    }
  });

  // Update the source with the new data.
  (map.getSource(sourceLayerId) as maplibregl.GeoJSONSource).setData(
    targetLayer.data.geojson
  );

  // Add the new layer. This function call includes instrumentation.
  addLayer(map, targetLayer);
}
