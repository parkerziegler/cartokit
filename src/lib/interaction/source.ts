import type { Map, MapSourceDataEvent } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';

import { addLayer } from '$lib/interaction/layer';
import { sourceWorker } from '$lib/utils/worker';
import { generateCartoKitLayer } from '$lib/utils/layer';
import { ir } from '$lib/stores/ir';

type AddSourceOptions =
  | {
      kind: 'api';
      displayName: string;
      url: string;
      onSourceLoaded: () => void;
    }
  | {
      kind: 'file';
      displayName: string;
      fileName: string;
      featureCollection: FeatureCollection;
    };

/**
 * Add a source for a CartoKit layer to the map.
 *
 * @param map – The top-level MapLibre GL map instance.
 * @param layer – The CartoKit layer to add a source for.
 */
export function addSource(map: Map, options: AddSourceOptions) {
  if (options.kind === 'api') {
    // Load the data in a worker thread.
    sourceWorker(options.url, (data) => {
      const layer = generateCartoKitLayer(data, options);

      const handleSourceLoaded = (event: MapSourceDataEvent) => {
        if (event.sourceId === layer.id) {
          options.onSourceLoaded();
          map.off('sourcedata', handleSourceLoaded);
        }
      };

      map.on('sourcedata', handleSourceLoaded);

      map.addSource(layer.id, {
        type: 'geojson',
        // Still use the API endpoint when available to speed up vector tile generation.
        data: layer.data.url,
        generateId: true
      });

      ir.update((ir) => {
        ir.layers[layer.id] = layer;

        return ir;
      });

      addLayer(map, layer);
    });
  } else {
    const layer = generateCartoKitLayer(options.featureCollection, options);

    map.addSource(layer.id, {
      type: 'geojson',
      data: layer.data.geoJSON,
      generateId: true
    });

    ir.update((ir) => {
      ir.layers[layer.id] = layer;

      return ir;
    });

    addLayer(map, layer);
  }
}
