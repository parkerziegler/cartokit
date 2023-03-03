import type { FeatureCollection } from 'geojson';

import type { MapType } from '$lib/types/MapTypes';
import type { ColorScale } from '$lib/types/ColorScales';

interface Layer {
	id: string;
	displayName: string;
	type: MapType;
	data: {
		url?: string;
		geoJSON: FeatureCollection;
	};
	style: {
		opacity: number;
	};
}

export interface CartoKitFillLayer extends Layer {
	type: 'Fill';
	style: {
		fill: string;
		opacity: number;
	};
}

/**
 * A type guard to determine if a CartoKit layer is a CartoKitFillLayer.
 *
 * @param layer – The layer to test.
 *
 * @returns – A Boolean value indicating whether the layer is a CartoKitFillLayer.
 */
export function isFillLayer(layer: CartoKitLayer): layer is CartoKitFillLayer {
	return layer.type === 'Fill';
}

export interface CartoKitChoroplethLayer extends Layer {
	type: 'Choropleth';
	attribute: string;
	style: {
		breaks: {
			scale: ColorScale;
			colors: string[];
		};
		opacity: number;
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

export interface CartoKitProportionalSymbolLayer extends Layer {
	type: 'Proportional Symbol';
	attribute: string;
	style: {
		radius: {
			min: number;
			max: number;
		};
		breaks?: {
			scale: ColorScale;
			colors: string[];
		};
		opacity: number;
	};
}

export type CartoKitLayer =
	| CartoKitFillLayer
	| CartoKitChoroplethLayer
	| CartoKitProportionalSymbolLayer;
