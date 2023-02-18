import type { MapType } from './MapTypes';

interface Layer {
	id: string;
	displayName: string;
	type: MapType;
	data: string; // Need to extend to valid GeoJSON.
}

export interface CartoKitChoroplethLayer extends Layer {
	type: 'Choropleth';
	attribute: string;
	breaks: {
		count: number;
		scale: 'Quantile' | 'Quantize';
		colors: string[];
	};
}

/**
 * A type guard to determine if a CartoKit layer is a CartoKitChoroplethLayer.
 *
 * @param layer – The layer to test.
 *
 * @returns – A Boolean value indicating whether the layer is a CartoKitChoroplethLayer.
 */
export function isChoroplethLayer(layer: CartoKitLayer): layer is CartoKitChoroplethLayer {
	return layer.type === 'Choropleth';
}

interface CartoKitFillLayer extends Layer {
	type: 'Fill';
}

export type CartoKitLayer = CartoKitChoroplethLayer | CartoKitFillLayer;
