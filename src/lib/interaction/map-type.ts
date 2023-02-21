import type { Map } from 'mapbox-gl';

import { isChoroplethLayer, type CartoKitLayer } from '$lib/types/CartoKitLayer';
import type { MapType } from '$lib/types/MapTypes';

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
			return {
				id: layer.id,
				displayName: layer.displayName,
				type: 'Choropleth',
				data: layer.data,
				attribute: '',
				breaks: {
					count: 5,
					scale: 'Quantile',
					colors: ['#f1eef6', '#bdc9e1', '#74a9cf', '#2b8cbe', '#045a8d']
				}
			};
	}
}

function transitionToFill(map: Map, layer: CartoKitLayer): CartoKitLayer {
	const fill = isChoroplethLayer(layer)
		? layer.breaks.colors[Math.floor(layer.breaks.colors.length / 2)]
		: '#FFFFFF';

	map.setPaintProperty(layer.id, 'fill-color', fill);

	return {
		id: layer.id,
		displayName: layer.displayName,
		type: 'Fill',
		data: layer.data,
		fill,
		opacity: 1
	};
}
