import type { Map } from 'mapbox-gl';

import type { CartoKitLayer } from '$lib/types/CartoKitLayer';
import { deriveColorScale } from '$lib/interaction/color';

/**
 * Add a CartoKit layer to the map.
 *
 * @param map – The top-level Mapbox GL map instance.
 * @param layer – The CartoKit layer to add to the map.
 */
export function addLayer(map: Map, layer: CartoKitLayer): void {
	switch (layer.type) {
		case 'Fill':
			map.addLayer({
				id: layer.id,
				source: layer.id,
				type: 'fill',
				paint: {
					'fill-color': '#fd6a0b',
					'fill-opacity': 1
				}
			});
			break;
		case 'Choropleth': {
			map.addLayer({
				id: layer.id,
				source: layer.id,
				type: 'fill'
			});

			let hasSourceLoadedPreviously = false;

			map.on('sourcedata', (event) => {
				if (
					event.sourceId === layer.id &&
					event.isSourceLoaded &&
					event.sourceDataType !== 'metadata' &&
					!hasSourceLoadedPreviously
				) {
					hasSourceLoadedPreviously = true;
					const features = map.querySourceFeatures(layer.id);

					map.setPaintProperty(layer.id, 'fill-color', deriveColorScale(layer, features));
				}
			});
			break;
		}
	}
}
