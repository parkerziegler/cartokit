import type { Map } from 'mapbox-gl';

import { isChoroplethLayer, type CartoKitLayer } from '$lib/types/CartoKitLayer';
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
			let hasSourceLoadedPreviously = false;

			map.on('sourcedata', (event) => {
				if (
					event.sourceId === layer.id &&
					event.isSourceLoaded &&
					event.sourceDataType !== 'metadata' &&
					!hasSourceLoadedPreviously
				) {
					hasSourceLoadedPreviously = true;

					map.addLayer({
						id: layer.id,
						source: layer.id,
						type: 'fill',
						paint: {
							'fill-color': 'transparent' // Make features transparent until we derive a color scale.
						}
					});

					const features = map.querySourceFeatures(layer.id);

					map.setPaintProperty(layer.id, 'fill-color', deriveColorScale(layer, features));
				}
			});
			break;
		}
	}
}

interface LayerUpdate {
	map: Map;
	layer: CartoKitLayer;
}

interface ColorScaleUpdate extends LayerUpdate {
	type: 'color-scale';
}

interface FillUpdate extends LayerUpdate {
	type: 'fill';
	payload: {
		color: string;
	};
}

interface FillOpacityUpdate extends LayerUpdate {
	type: 'opacity';
	payload: {
		opacity: number;
	};
}

type DispatchLayerUpdateParams = ColorScaleUpdate | FillUpdate | FillOpacityUpdate;

/**
 * Dispatch standardized updates to specific layers.
 *
 * @param type – The type of update to dispatch.
 * @param map – The top-level Mapbox GL map instance.
 * @param layer – The CartoKit layer to update.
 * @param payload – The payload for the update.
 */
export function dispatchLayerUpdate(update: DispatchLayerUpdateParams): void {
	switch (update.type) {
		case 'color-scale': {
			if (isChoroplethLayer(update.layer)) {
				update.map.setPaintProperty(
					update.layer.id,
					'fill-color',
					deriveColorScale(update.layer, update.map.querySourceFeatures(update.layer.id))
				);
			}
			break;
		}
		case 'fill': {
			update.map.setPaintProperty(update.layer.id, 'fill-color', update.payload.color);
			break;
		}
		case 'opacity': {
			update.map.setPaintProperty(update.layer.id, 'fill-opacity', update.payload.opacity);
		}
	}
}
