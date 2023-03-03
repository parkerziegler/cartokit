import type { Map } from 'mapbox-gl';

import { dispatchLayerUpdate } from '$lib/interaction/update';
import type { CartoKitLayer } from '$lib/types/CartoKitLayer';
import { sourceWorker } from '$lib/utils/worker';
import { addLayer } from './layer';

/**
 * Add a source for a CartoKit layer to the map.
 *
 * @param map – The top-level Mapbox GL map instance.
 * @param layer – The CartoKit layer to add a source for.
 */
export function addSource(map: Map, layer: CartoKitLayer) {
	if (layer.data.url) {
		// Load the data in a worker thread.
		sourceWorker(layer.data.url, (data) => {
			dispatchLayerUpdate({
				type: 'data',
				map,
				layer,
				payload: {
					geoJSON: data
				}
			});

			map.addSource(layer.id, {
				type: 'geojson',
				data,
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
