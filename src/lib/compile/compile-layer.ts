import type { Map } from 'mapbox-gl';

import { compilePaint } from '$lib/compile/compile-paint';
import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

/**
 * Compile the CartoKit layer IR into a Mapbox GL JS program fragment.
 *
 * @param layer – the CartoKit layer to compile.
 *
 * @returns – a Mapbox GL JS program fragment.
 */
export function compileLayer(map: Map, layer: CartoKitLayer): string {
	switch (layer.type) {
		case 'Fill':
		case 'Choropleth': {
			const paint = compilePaint(map, layer);

			return `
			map.addLayer({
				id: '${layer.id}',
				source: '${layer.id}',
				type: 'fill',
				${paint}
			});
			`;
		}
	}
}
