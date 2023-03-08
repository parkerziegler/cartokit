import type { Map } from 'maplibre-gl';

import { deriveColorScale } from '$lib/interaction/color';
import { deriveRadii } from '$lib/interaction/geometry';
import { instrumentPolygonHover, instrumentPointHover } from '$lib/interaction/hover';
import { instrumentPolygonSelect, instrumentPointSelect } from '$lib/interaction/select';
import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

/**
 * Add a CartoKit layer to the map.
 *
 * @param map – The top-level MapLibre GL map instance.
 * @param layer – The CartoKit layer to add to the map.
 */
export function addLayer(map: Map, layer: CartoKitLayer): void {
	switch (layer.type) {
		case 'Fill': {
			map.addLayer({
				id: layer.id,
				source: layer.id,
				type: 'fill',
				paint: {
					'fill-color': layer.style.fill,
					'fill-opacity': layer.style.opacity
				}
			});

			instrumentPolygonHover(map, layer);
			instrumentPolygonSelect(map, layer);
			break;
		}
		case 'Choropleth': {
			map.addLayer({
				id: layer.id,
				source: layer.id,
				type: 'fill',
				paint: {
					'fill-color': deriveColorScale(layer),
					'fill-opacity': layer.style.opacity
				}
			});

			instrumentPolygonHover(map, layer);
			instrumentPolygonSelect(map, layer);
			break;
		}
		case 'Proportional Symbol': {
			map.addLayer({
				id: layer.id,
				source: layer.id,
				type: 'circle',
				paint: {
					'circle-color': layer.style.fill,
					'circle-radius': deriveRadii(layer),
					'circle-opacity': layer.style.opacity
				}
			});

			instrumentPointHover(map, layer);
			instrumentPointSelect(map, layer);
			break;
		}
	}
}
