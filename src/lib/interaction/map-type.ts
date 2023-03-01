import type { Map } from 'mapbox-gl';

import type {
	CartoKitFillLayer,
	CartoKitChoroplethLayer,
	CartoKitProportionalSymbolLayer,
	CartoKitLayer
} from '$lib/types/CartoKitLayer';
import type { MapType } from '$lib/types/MapTypes';
import { deriveColorScale } from '$lib/interaction/color';
import { randomColor } from '$lib/utils/color';
import { DEFAULT_PALETTE } from '$lib/utils/constants';
import { isPropertyNumeric } from '$lib/utils/property';

interface TransitionMapTypeParams {
	map: Map;
	layer: CartoKitLayer;
	targetMapType: MapType;
}

/**
 * Transition a layer from one map type to another. For cross-geometry transitions,
 * this will create a new layer and remove the previous layer.
 *
 * @param map — The top-level Mapbox GL map instance.
 * @param layer — The CartoKitLayer to transition.
 * @param targetMapType — The map type to transition to.
 *
 * @returns — The transitioned CartoKitLayer.
 */
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
		case 'Proportional Symbol':
			return transitionToProportionalSymbol(map, layer);
	}
}

/**
 * Transition a layer to a polygon fill layer.
 *
 * @param map — The top-level Mapbox GL map instance.
 * @param layer — The CartoKit layer to transition.
 *
 * @returns — The transitioned CartoKitFillLayer.
 */
function transitionToFill(map: Map, layer: CartoKitLayer): CartoKitFillLayer {
	const fill = randomColor();
	map.setPaintProperty(layer.id, 'fill-color', fill);

	return {
		id: layer.id,
		displayName: layer.displayName,
		type: 'Fill',
		data: layer.data,
		geometry: 'Polygon',
		style: {
			fill,
			opacity: layer.style.opacity
		}
	};
}

/**
 * Transition a layer to a choropleth layer.
 *
 * @param map — The top-level Mapbox GL map instance.
 * @param layer — The CartoKit layer to transition.
 *
 * @returns – The transitioned CartoKitChoroplethLayer.
 */
function transitionToChoropleth(map: Map, layer: CartoKitLayer): CartoKitChoroplethLayer {
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
		geometry: 'Polygon',
		attribute,
		style: {
			breaks: {
				scale: 'Quantile',
				colors: DEFAULT_PALETTE
			},
			opacity: layer.style.opacity
		}
	};

	map.setPaintProperty(layer.id, 'fill-color', deriveColorScale(targetLayer, features));

	return targetLayer;
}

/**
 * Transition a layer to a proportional symbol layer.
 *
 * @param map — The top-level Mapbox GL map instance.
 * @param layer — The CartoKit layer to transition.
 *
 * @returns – The transitioned CartoKitProportionalSymbolLayer.
 */
function transitionToProportionalSymbol(
	map: Map,
	layer: CartoKitLayer
): CartoKitProportionalSymbolLayer {
	// If the current layer geometry and the target don't match, remove the layer and
	// all instrumented layers.
	if (layer.geometry !== 'Point') {
		map.removeLayer(layer.id);
		map.removeLayer(`${layer.id}-hover`);
		map.removeLayer(`${layer.id}-select`);
	}

	const targetLayer: CartoKitProportionalSymbolLayer = {
		id: layer.id,
		displayName: layer.displayName,
		type: 'Proportional Symbol',
		data: layer.data,
		geometry: 'Point',
		attribute: selectNumericAttribute(map.querySourceFeatures(layer.id)),
		style: {
			radius: {
				min: 1,
				max: 50
			},
			opacity: layer.style.opacity
		}
	};

	addProportionalSymbolLayer(map, targetLayer);

	return targetLayer;
}

/**
 * Add a proportional symbol layer to the map.
 *
 * @param map – The top-level Mapbox GL map instance.
 * @param layer – The CartoKitProportionalSymbolLayer to add.
 */
function addProportionalSymbolLayer(map: Map, layer: CartoKitProportionalSymbolLayer): void {
	map.addLayer({
		id: layer.id,
		type: 'circle',
		source: layer.id,
		paint: {
			'circle-radius': ['sqrt', ['get', layer.attribute]]
		}
	});
}

/**
 * Select a numeric attribute from a GeoJSON dataset.
 *
 * @param data – The GeoJSON dataset.
 *
 * @returns – The name of the first numeric attribute found in the input GeoJSON dataset.
 */
function selectNumericAttribute(data: GeoJSON.Feature[]): string {
	for (const property in data[0].properties) {
		if (isPropertyNumeric(data[0].properties[property])) {
			return property;
		}
	}

	// TODO: Catch this error and display a message prompting the user
	// to select a layer type that does not require a numeric attribute.
	throw new Error('No numeric attributes found in dataset.');
}
