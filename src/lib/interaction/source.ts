import type { Map } from 'maplibre-gl';

import { addLayer } from '$lib/interaction/layer';
import { dispatchLayerUpdate } from '$lib/interaction/update';
import type { CartoKitLayer } from '$lib/types/CartoKitLayer';
import { sourceWorker } from '$lib/utils/worker';

/**
 * Add a source for a CartoKit layer to the map.
 *
 * @param map – The top-level MapLibre GL map instance.
 * @param layer – The CartoKit layer to add a source for.
 */
export function addSource(map: Map, layer: CartoKitLayer) {
  if (layer.data.url) {
    // Load the data in a worker thread.
    sourceWorker(layer.data.url, (data) => {
      dispatchLayerUpdate({
        type: 'initial-data',
        layer,
        payload: {
          geoJSON: data
        }
      });

      map.addSource(layer.id, {
        type: 'geojson',
        // Still use the API endpoint when available to speed up vector tile generation.
        data: layer.data.url,
        generateId: true
      });

      addLayer(map, layer);
    });
  } else {
    map.addSource(layer.id, {
      type: 'geojson',
      data: layer.data.geoJSON,
      generateId: true
    });

    addLayer(map, layer);
  }
}
