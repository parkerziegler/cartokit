import type { Map, GeoJSONSource } from 'maplibre-gl';

import { addLayer } from '$lib/interaction/layer';
import { listeners, type LayerListeners } from '$lib/stores/listeners';
import type { CartoKitLayer } from '$lib/types';
import { getInstrumentedLayerIds } from '$lib/utils/layer';

export function redraw(
  map: Map,
  sourceLayer: CartoKitLayer,
  targetLayer: CartoKitLayer
) {
  // Remove all event listeners for the existing layer.
  listeners.update((ls) => {
    if (ls.has(sourceLayer.id)) {
      // This is a safe non-null assertion — we know the listeners exist via the call to .has.
      Object.entries(ls.get(sourceLayer.id)!).forEach(([event, listener]) => {
        map.off(event as keyof LayerListeners, sourceLayer.id, listener);
      });
    }

    ls.delete(sourceLayer.id);

    return ls;
  });

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
