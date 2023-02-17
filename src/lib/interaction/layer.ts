import type { Map } from 'mapbox-gl';

import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

/**
 * Add a CartoKit layer to the map.
 *
 * @param map – The top-level Mapbox GL map instance.
 * @param layer – The CartoKit layer to add to the map.
 */
export function addLayer(map: Map, layer: CartoKitLayer) {
	map.addLayer({
		id: layer.id,
		source: layer.id,
		type: 'fill',
		paint: {
			'fill-color': layer.id.includes('ca') ? '#1ff498' : '#fd6a0b',
			'fill-opacity': 0.75
		}
	});
}
