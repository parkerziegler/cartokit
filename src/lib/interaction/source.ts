import type { Map } from 'mapbox-gl';

import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

/**
 * Add a source for a CartoKit layer to the map.
 *
 * @param map – The top-level Mapbox GL map instance.
 * @param layer – The CartoKit layer to add a source for.
 */
export function addSource(map: Map, layer: CartoKitLayer) {
	map.addSource(layer.id, {
		type: 'geojson',
		data: layer.data,
		generateId: true
	});
}
