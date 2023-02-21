import type { Map } from 'mapbox-gl';

import { isChoroplethLayer, isFillLayer, type CartoKitLayer } from '$lib/types/CartoKitLayer';
import { deriveColorScale } from '$lib/interaction/color';
import { layers as layersStore } from '$lib/stores/layers';
import { program } from '$lib/stores/program';
import { compile } from '$lib/compile/compile';
import type { ColorScales } from '$lib/types/ColorScales';

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
	layers: CartoKitLayer[];
}

interface ColorScaleTypeUpdate extends LayerUpdate {
	type: 'color-scale-type';
	payload: {
		scale: ColorScales;
	};
}

interface AttributeUpdate extends LayerUpdate {
	type: 'attribute';
	payload: {
		attribute: string;
	};
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

type DispatchLayerUpdateParams =
	| ColorScaleTypeUpdate
	| AttributeUpdate
	| FillUpdate
	| FillOpacityUpdate;

/**
 * Dispatch standardized updates to specific layers.
 *
 * @param type – The type of update to dispatch.
 * @param map – The top-level Mapbox GL map instance.
 * @param layer – The CartoKit layer to update.
 * @param layers — The array of CartoKit layers.
 * @param payload – The payload for the update.
 */
export function dispatchLayerUpdate(update: DispatchLayerUpdateParams): void {
	switch (update.type) {
		case 'color-scale-type': {
			if (isChoroplethLayer(update.layer)) {
				layersStore.update((ls) => {
					const layer = ls.find((l) => l.id === update.layer.id);

					if (layer && isChoroplethLayer(layer)) {
						layer.breaks.scale = update.payload.scale;

						update.map.setPaintProperty(
							update.layer.id,
							'fill-color',
							deriveColorScale(layer, update.map.querySourceFeatures(update.layer.id))
						);
					}

					return ls;
				});
			}
			break;
		}
		case 'attribute': {
			if (isChoroplethLayer(update.layer)) {
				layersStore.update((ls) => {
					const layer = ls.find((l) => l.id === update.layer.id);

					if (layer && isChoroplethLayer(layer)) {
						layer.attribute = update.payload.attribute;

						update.map.setPaintProperty(
							update.layer.id,
							'fill-color',
							deriveColorScale(layer, update.map.querySourceFeatures(update.layer.id))
						);
					}

					return ls;
				});
			}
			break;
		}
		case 'fill': {
			update.map.setPaintProperty(update.layer.id, 'fill-color', update.payload.color);

			// Update the layer in the store.
			layersStore.update((layers) => {
				const layer = layers.find((layer) => layer.id === update.layer.id);

				if (layer && isFillLayer(layer)) {
					layer.fill = update.payload.color;
				}

				return layers;
			});
			break;
		}
		case 'opacity': {
			update.map.setPaintProperty(update.layer.id, 'fill-opacity', update.payload.opacity);

			// Update the layer in the store.
			layersStore.update((layers) => {
				const layer = layers.find((layer) => layer.id === update.layer.id);

				if (layer && isFillLayer(layer)) {
					layer.opacity = update.payload.opacity;
				}

				return layers;
			});
			break;
		}
	}

	program.set(compile(update.map, update.layers));
}
