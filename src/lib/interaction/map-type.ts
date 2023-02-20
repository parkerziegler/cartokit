import type { CartoKitLayer } from '$lib/types/CartoKitLayer';
import type { MapType } from '$lib/types/MapTypes';

export function transitionMapType(layer: CartoKitLayer, targetMapType: MapType): CartoKitLayer {
	switch (targetMapType) {
		case 'Fill':
			return {
				id: layer.id,
				displayName: layer.displayName,
				type: 'Fill',
				data: layer.data
			};
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
