import * as d3 from 'd3';
import type { ExpressionSpecification } from 'maplibre-gl';

import type { CartoKitProportionalSymbolLayer } from '$lib/types/CartoKitLayer';

/**
 * Derive a MapLibre GL JS expression for a proportional symbol radius scale.
 *
 * @param layer – The CartoKitProportionalSymbolLayer to derive a radius scale for.
 *
 * @returns – a MapLibre GL JS expression for a proportional symbol radius scale.
 */
export function deriveRadii(layer: CartoKitProportionalSymbolLayer): ExpressionSpecification {
	const {
		attribute,
		data: {
			geoJSON: { features }
		},
		style: {
			radius: { min: rMin, max: rMax }
		}
	} = layer;

	const extent = d3.extent(features, (d) => Math.sqrt(d.properties?.[attribute] ?? 0));
	const [min, max] = [extent[0] ?? 0, extent[1] ?? 1];
	return ['interpolate', ['linear'], ['sqrt', ['get', attribute]], min, rMin, max, rMax];
}
