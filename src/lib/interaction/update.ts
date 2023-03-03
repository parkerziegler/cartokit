import type { Map } from 'mapbox-gl';
import type { FeatureCollection } from 'geojson';

import { deriveColorScale } from '$lib/interaction/color';
import { transitionMapType } from '$lib/interaction/map-type';
import { layers } from '$lib/stores/layers';
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

interface DataUpdate extends LayerUpdate {
	type: 'data';
	payload: {
		geoJSON: FeatureCollection;
	};
}

type DispatchLayerUpdateParams =
	| MapTypeUpdate
	| ColorScaleTypeUpdate
	| ColorPaletteColorUpdate
	| ColorPaletteStopsUpdate
	| AttributeUpdate
	| FillUpdate
	| FillOpacityUpdate
	| DataUpdate;

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

			layers.update((lyrs) => {
				lyrs[layer.id] = targetLayer;

				return lyrs;
			});
			break;
		}
		case 'color-scale-type': {
			if (isChoroplethLayer(layer)) {
				layers.update((lyrs) => {
					const lyr = lyrs[layer.id];

					if (isChoroplethLayer(lyr)) {
						lyr.style.breaks.scale = payload.scale;

						map.setPaintProperty(lyr.id, 'fill-color', deriveColorScale(lyr));
					}

					return lyrs;
				});
			}
			break;
		}
		case 'color-palette-color': {
			if (isChoroplethLayer(layer)) {
				layers.update((lyrs) => {
					const lyr = lyrs[layer.id];

					if (isChoroplethLayer(lyr)) {
						lyr.style.breaks.colors[payload.index] = payload.color;

						map.setPaintProperty(lyr.id, 'fill-color', deriveColorScale(lyr));
					}

					return lyrs;
				});
			}
			break;
		}
		case 'color-palette-stops': {
			if (isChoroplethLayer(layer)) {
				layers.update((lyrs) => {
					const lyr = lyrs[layer.id];

					if (isChoroplethLayer(lyr)) {
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

						map.setPaintProperty(lyr.id, 'fill-color', deriveColorScale(lyr));
					}

					return lyrs;
				});
			}
			break;
		}
		case 'attribute': {
			if (isChoroplethLayer(layer)) {
				layers.update((lyrs) => {
					const lyr = lyrs[layer.id];

					if (isChoroplethLayer(lyr)) {
						lyr.attribute = payload.attribute;

						map.setPaintProperty(lyr.id, 'fill-color', deriveColorScale(lyr));
					}

					return lyrs;
				});
			}
			break;
		}
		case 'fill': {
			layers.update((lyrs) => {
				const lyr = lyrs[layer.id];

				if (isFillLayer(lyr)) {
					lyr.style.fill = payload.color;

					map.setPaintProperty(layer.id, 'fill-color', payload.color);
				}

				return lyrs;
			});
			break;
		}
		case 'opacity': {
			// Update the layer in the store.
			layers.update((lyrs) => {
				const lyr = lyrs[layer.id];

				if (lyr) {
					layer.style.opacity = payload.opacity;

					map.setPaintProperty(layer.id, 'fill-opacity', payload.opacity);
				}

				return lyrs;
			});
			break;
		}
		case 'data': {
			layers.update((lyrs) => {
				const lyr = lyrs[layer.id];

				if (lyr) {
					lyr.data.geoJSON = payload.geoJSON;
				}

				return lyrs;
			});
		}
	}
}
