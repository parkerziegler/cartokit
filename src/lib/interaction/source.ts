import * as Comlink from 'comlink';
import type { FeatureCollection } from 'geojson';
import type { Map, MapSourceDataEvent } from 'maplibre-gl';

import { addLayer, generateCartoKitLayer } from '$lib/interaction/layer';
import { catalog } from '$lib/stores/catalog';
import { ir } from '$lib/stores/ir';
import type { CartoKitLayer, Catalog } from '$lib/types';
import { sourceWorker } from '$lib/utils/worker';

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
      onSourceLoaded: () => void;
    };

/**
 * Load a source for a @see{CartoKitLayer}.
 *
 * @param map – The top-level MapLibre GL map instance.
 * @param options – The options for the source.
 * @param data – The GeoJSON data for the source.
 */
async function loadSource(
  map: Map,
  options: AddSourceOptions,
  data: FeatureCollection
) {
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
    data: options.kind === 'api' ? options.url : options.featureCollection,
    generateId: true
  });

  ir.update((ir) => {
    ir.layers[layer.id] = layer;

    return ir;
  });

  // Build the catalog for the layer in a worker thread.
  const catalogWorker = new Worker(
    new URL('$lib/utils/catalog.ts', import.meta.url),
    { type: 'module' }
  );
  const buildCatalog =
    Comlink.wrap<(layer: CartoKitLayer) => Catalog>(catalogWorker);
  const catalogUpdate = await buildCatalog(layer);

  catalog.update((catalog) => {
    return { ...catalog, ...catalogUpdate };
  });

  addLayer(map, layer);
}

/**
 * Add a source for a @see{CartoKitLayer} to the map.
 *
 * @param map – The top-level MapLibre GL map instance.
 * @param layer – The @see{CartoKitLayer}.
 */
export function addSource(map: Map, options: AddSourceOptions) {
  if (options.kind === 'api') {
    // Load the data in a worker thread.
    sourceWorker(options.url, (data) => {
      loadSource(map, options, data);
    });
  } else {
    loadSource(map, options, options.featureCollection);
  }
}
