import type { Map } from 'mapbox-gl';

import {
	isChoroplethLayer,
	type CartoKitChoroplethLayer,
	type CartoKitLayer
} from '$lib/types/CartoKitLayer';
import type { MapType } from '$lib/types/MapTypes';
import { deriveColorScale } from '$lib/interaction/color';

interface TransitionMapTypeParams {
	map: Map;
	layer: CartoKitLayer;
	targetMapType: MapType;
}

export function transitionMapType({
	map,
	layer,
	targetMapType
}: TransitionMapTypeParams): CartoKitLayer {
	switch (targetMapType) {
		case 'Fill':
			return transitionToFill(map, layer);
		case 'Choropleth':
			return transitionToChoropleth(map, layer);
	}
}

function transitionToFill(map: Map, layer: CartoKitLayer): CartoKitLayer {
	const fill = isChoroplethLayer(layer)
		? layer.style.breaks.colors[Math.floor(layer.style.breaks.colors.length / 2)]
		: '#FFFFFF';

	map.setPaintProperty(layer.id, 'fill-color', fill);

	return {
		id: layer.id,
		displayName: layer.displayName,
		type: 'Fill',
		data: layer.data,
		style: {
			fill,
			opacity: layer.style.opacity
		}
	};
}

function transitionToChoropleth(map: Map, layer: CartoKitLayer): CartoKitLayer {
	// Select the first numeric attribute in the dataset.
	const features = map.querySourceFeatures(layer.id);
	let attribute = '';

	if (features[0].properties) {
		for (const property in features[0].properties) {
			if (typeof features[0].properties[property] === 'number') {
				attribute = property;
				break;
			}
		}
	}

	const targetLayer: CartoKitChoroplethLayer = {
		id: layer.id,
		displayName: layer.displayName,
		type: 'Choropleth',
		data: layer.data,
		attribute,
		style: {
			breaks: {
				count: 5,
				scale: 'Quantile',
				colors: ['#feedde', '#fdbe85', '#fd8d3c', '#e6550d', '#a63603']
			},
			opacity: layer.style.opacity
		}
	};

	map.setPaintProperty(layer.id, 'fill-color', deriveColorScale(targetLayer, features));

	return targetLayer;
}
