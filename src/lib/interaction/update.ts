import type { Map } from 'mapbox-gl';

import { deriveColorScale } from '$lib/interaction/color';
import { transitionMapType } from '$lib/interaction/map-type';
import { layers as layersStore } from '$lib/stores/layers';
import { isChoroplethLayer, isFillLayer, type CartoKitLayer } from '$lib/types/CartoKitLayer';
import type { ColorScale } from '$lib/types/ColorScales';
import type { MapType } from '$lib/types/MapTypes';
import { randomColor } from '$lib/utils/color';

interface LayerUpdate {
	map: Map;
	layer: CartoKitLayer;
}

interface MapTypeUpdate extends LayerUpdate {
	type: 'map-type';
	payload: {
		mapType: MapType;
	};
}

interface ColorScaleTypeUpdate extends LayerUpdate {
	type: 'color-scale-type';
	payload: {
		scale: ColorScale;
	};
}

interface ColorPaletteColorUpdate extends LayerUpdate {
	type: 'color-palette-color';
	payload: {
		index: number;
		color: string;
	};
}

interface ColorPaletteStopsUpdate extends LayerUpdate {
	type: 'color-palette-stops';
	payload: {
		count: number;
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
	| MapTypeUpdate
	| ColorScaleTypeUpdate
	| ColorPaletteColorUpdate
	| ColorPaletteStopsUpdate
	| AttributeUpdate
	| FillUpdate
	| FillOpacityUpdate;

/**
 * Dispatch standardized updates to specific layers.
 *
 * @param type – The type of update to dispatch.
 * @param map – The top-level Mapbox GL map instance.
 * @param layer – The CartoKit layer to update.
 * @param payload – The payload for the update.
 */
export function dispatchLayerUpdate({
	type,
	map,
	layer,
	payload
}: DispatchLayerUpdateParams): void {
	switch (type) {
		case 'map-type': {
			const targetLayer = transitionMapType({
				map,
				layer,
				targetMapType: payload.mapType
			});

			layersStore.update((ls) => {
				const idx = ls.findIndex((l) => l.id === layer.id);

				return [...ls.slice(0, idx), targetLayer, ...ls.slice(idx + 1)];
			});
			break;
		}
		case 'color-scale-type': {
			if (isChoroplethLayer(layer)) {
				layersStore.update((ls) => {
					const lyr = ls.find((l) => l.id === layer.id);

					if (lyr && isChoroplethLayer(lyr)) {
						lyr.style.breaks.scale = payload.scale;

						map.setPaintProperty(
							lyr.id,
							'fill-color',
							deriveColorScale(lyr, map.querySourceFeatures(lyr.id))
						);
					}

					return ls;
				});
			}
			break;
		}
		case 'color-palette-color': {
			if (isChoroplethLayer(layer)) {
				layersStore.update((ls) => {
					const lyr = ls.find((l) => l.id === layer.id);

					if (lyr && isChoroplethLayer(lyr)) {
						lyr.style.breaks.colors[payload.index] = payload.color;

						map.setPaintProperty(
							lyr.id,
							'fill-color',
							deriveColorScale(lyr, map.querySourceFeatures(layer.id))
						);
					}

					return ls;
				});
			}
			break;
		}
		case 'color-palette-stops': {
			if (isChoroplethLayer(layer)) {
				layersStore.update((ls) => {
					const lyr = ls.find((l) => l.id === layer.id);

					if (lyr && isChoroplethLayer(lyr)) {
						const diff = payload.count - lyr.style.breaks.colors.length;

						if (Math.sign(diff) === 1) {
							lyr.style.breaks.colors = lyr.style.breaks.colors.concat(
								new Array(diff).fill(undefined).map(randomColor)
							);
						} else if (Math.sign(diff) === -1) {
							lyr.style.breaks.colors = lyr.style.breaks.colors.slice(
								0,
								lyr.style.breaks.colors.length + diff
							);
						}

						map.setPaintProperty(
							lyr.id,
							'fill-color',
							deriveColorScale(lyr, map.querySourceFeatures(lyr.id))
						);
					}

					return ls;
				});
			}
			break;
		}
		case 'attribute': {
			if (isChoroplethLayer(layer)) {
				layersStore.update((ls) => {
					const lyr = ls.find((l) => l.id === layer.id);

					if (lyr && isChoroplethLayer(lyr)) {
						lyr.attribute = payload.attribute;

						map.setPaintProperty(
							lyr.id,
							'fill-color',
							deriveColorScale(lyr, map.querySourceFeatures(layer.id))
						);
					}

					return ls;
				});
			}
			break;
		}
		case 'fill': {
			map.setPaintProperty(layer.id, 'fill-color', payload.color);

			// Update the layer in the store.
			layersStore.update((layers) => {
				const lyr = layers.find((layer) => layer.id === layer.id);

				if (lyr && isFillLayer(lyr)) {
					lyr.style.fill = payload.color;
				}

				return layers;
			});
			break;
		}
		case 'opacity': {
			map.setPaintProperty(layer.id, 'fill-opacity', payload.opacity);

			// Update the layer in the store.
			layersStore.update((layers) => {
				const lyr = layers.find((l) => l.id === layer.id);

				if (lyr) {
					layer.style.opacity = payload.opacity;
				}

				return layers;
			});
			break;
		}
	}
}
