import { deriveColorScale } from '$lib/interaction/color';
import type { CartoKitLayer } from '$lib/types/CartoKitLayer';
import { DEFAULT_FILL, DEFAULT_OPACITY } from '$lib/utils/constants';

/**
 * Compile a layer's presentational properties into a Mapbox GL JS program fragment.
 *
 * @param map – the Mapbox GL JS map instance.
 * @param layer – the CartoKit layer to compile.
 *
 * @returns – a Mapbox GL JS program fragment representing the layer's presentational properties.
 */
export function compilePaint(layer: CartoKitLayer): string {
	switch (layer.type) {
		case 'Fill': {
			if (layer.style.fill === DEFAULT_FILL && layer.style.opacity === DEFAULT_OPACITY) {
				return '';
			}

			return `paint: {
				${layer.style.fill !== DEFAULT_FILL ? `'fill-color' : '${layer.style.fill}'` : ''},
				${layer.style.opacity !== DEFAULT_OPACITY ? `'fill-opacity': ${layer.style.opacity}` : ''}
			}
			`;
		}
		case 'Choropleth': {
			return `paint: {
				'fill-color': ${JSON.stringify(deriveColorScale(layer))},
				${layer.style.opacity !== DEFAULT_OPACITY ? `'fill-opacity': ${layer.style.opacity}` : ''}
			}`;
		}
		case 'Proportional Symbol': {
			return 'TODO';
		}
	}
}
