import type { Map, GeoJSONSource } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';

import { deriveColorScale } from '$lib/interaction/color';
import { deriveSize } from '$lib/interaction/geometry';
import { addLayer } from '$lib/interaction/layer';
import { transitionMapType } from '$lib/interaction/map-type';
import { layers } from '$lib/stores/layers';
import {
	isChoroplethLayer,
	isFillLayer,
	isProportionalSymbolLayer,
	type CartoKitLayer
} from '$lib/types/CartoKitLayer';
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

interface InitialDataUpdate extends LayerUpdate {
	type: 'initial-data';
	payload: {
		geoJSON: FeatureCollection;
	};
}

interface SizeUpdate extends LayerUpdate {
	type: 'size';
	payload: {
		min?: number;
		max?: number;
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
	| InitialDataUpdate
	| SizeUpdate;

/**
 * Dispatch standardized updates to specific layers.
 *
 * @param type – The type of update to dispatch.
 * @param map – The top-level MapLibre GL map instance.
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
			const { targetLayer, redraw } = transitionMapType({
				map,
				layer,
				targetMapType: payload.mapType
			});

			if (redraw) {
				// Remove the existing layer and all instrumented layers.
				map.removeLayer(layer.id);

				if (map.getLayer(`${layer.id}-hover`)) {
					map.removeLayer(`${layer.id}-hover`);
				}

				if (map.getLayer(`${layer.id}-select`)) {
					map.removeLayer(`${layer.id}-select`);
				}

				// Update the source with the new data.
				(map.getSource(layer.id) as GeoJSONSource).setData(targetLayer.data.geoJSON);

				// Add the new layer. This function call includes instrumentation.
				addLayer(map, targetLayer);
			}

			layers.update((lyrs) => {
				lyrs[layer.id] = targetLayer;

				return lyrs;
			});
			break;
		}
		case 'color-scale-type': {
			layers.update((lyrs) => {
				const lyr = lyrs[layer.id];

				if (isChoroplethLayer(lyr)) {
					lyr.style.breaks.scale = payload.scale;

					map.setPaintProperty(lyr.id, 'fill-color', deriveColorScale(lyr));
				}

				return lyrs;
			});
			break;
		}
		case 'color-palette-color': {
			layers.update((lyrs) => {
				const lyr = lyrs[layer.id];

				if (isChoroplethLayer(lyr)) {
					lyr.style.breaks.colors[payload.index] = payload.color;

					map.setPaintProperty(lyr.id, 'fill-color', deriveColorScale(lyr));
				}

				return lyrs;
			});
			break;
		}
		case 'color-palette-stops': {
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
			break;
		}
		case 'attribute': {
			layers.update((lyrs) => {
				const lyr = lyrs[layer.id];

				if (isChoroplethLayer(lyr)) {
					lyr.attribute = payload.attribute;

					map.setPaintProperty(lyr.id, 'fill-color', deriveColorScale(lyr));
				}

				return lyrs;
			});
			break;
		}
		case 'fill': {
			layers.update((lyrs) => {
				const lyr = lyrs[layer.id];

				if (isFillLayer(lyr)) {
					lyr.style.fill = payload.color;

					map.setPaintProperty(layer.id, 'fill-color', payload.color);
				} else if (isProportionalSymbolLayer(lyr)) {
					lyr.style.fill = payload.color;

					map.setPaintProperty(layer.id, 'circle-color', payload.color);
				}

				return lyrs;
			});
			break;
		}
		case 'opacity': {
			layers.update((lyrs) => {
				const lyr = lyrs[layer.id];

				if (isFillLayer(lyr) || isChoroplethLayer(lyr)) {
					layer.style.opacity = payload.opacity;

					map.setPaintProperty(layer.id, 'fill-opacity', payload.opacity);
				} else if (isProportionalSymbolLayer(lyr)) {
					lyr.style.opacity = payload.opacity;

					map.setPaintProperty(layer.id, 'circle-opacity', payload.opacity);
				}

				return lyrs;
			});
			break;
		}
		case 'initial-data': {
			layers.update((lyrs) => {
				const lyr = lyrs[layer.id];

				if (lyr) {
					lyr.data.geoJSON = payload.geoJSON;

					// The initial data loaded for a layer gets preserved in the rawGeoJSON property.
					// This allows us to recover polygons when we do things like transition to points
					// and subsequently back to polygons.
					lyr.data.rawGeoJSON = payload.geoJSON;
				}

				return lyrs;
			});
			break;
		}
		case 'size': {
			layers.update((lyrs) => {
				const lyr = lyrs[layer.id];

				if (isProportionalSymbolLayer(lyr)) {
					if (payload.min) {
						lyr.style.size.min = payload.min;
					}

					if (payload.max) {
						lyr.style.size.max = payload.max;
					}

					map.setPaintProperty(layer.id, 'circle-radius', deriveSize(lyr));
				}

				return lyrs;
			});
		}
	}
}
