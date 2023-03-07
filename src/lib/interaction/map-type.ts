import type { Map } from 'maplibre-gl';
import * as turf from '@turf/turf';

import { deriveColorScale } from '$lib/interaction/color';
import {
	type CartoKitFillLayer,
	type CartoKitChoroplethLayer,
	type CartoKitProportionalSymbolLayer,
	type CartoKitLayer,
	isDataLayer
} from '$lib/types/CartoKitLayer';
import type { MapType } from '$lib/types/MapTypes';
import { randomColor } from '$lib/utils/color';
import { DEFAULT_PALETTE } from '$lib/utils/constants';
import { isPropertyNumeric } from '$lib/utils/property';
import { deriveRadii } from './geometry';

interface TransitionMapTypeParams {
	map: Map;
	layer: CartoKitLayer;
	targetMapType: MapType;
}

interface TransitionMapTypeReturnValue {
	targetLayer: CartoKitLayer;
	redraw: boolean;
}

/**
 * Transition a layer from one map type to another. For cross-geometry transitions,
 * this will create a new layer and remove the previous layer.
 *
 * @param map — The top-level MapLibre GL map instance.
 * @param layer — The CartoKitLayer to transition.
 * @param targetMapType — The map type to transition to.
 *
 * @returns — The transitioned CartoKitLayer.
 */
export function transitionMapType({
	map,
	layer,
	targetMapType
}: TransitionMapTypeParams): TransitionMapTypeReturnValue {
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
 * @param map — The top-level MapLibre GL map instance.
 * @param layer — The CartoKit layer to transition.
 *
 * @returns — The transitioned CartoKitFillLayer.
 */
function transitionToFill(map: Map, layer: CartoKitLayer): TransitionMapTypeReturnValue {
	let redraw = false;

	const geometry = layer.data.geoJSON.features[0].geometry;
	const rawGeometry = layer.data.rawGeoJSON.features[0].geometry;

	const fill = randomColor();
	const targetLayer: CartoKitFillLayer = {
		...layer,
		type: 'Fill',
		style: {
			fill,
			opacity: layer.style.opacity
		}
	};

	if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
		// Just update the fill color of the existing layer.
		map.setPaintProperty(layer.id, 'fill-color', fill);
	} else if (rawGeometry.type === 'Polygon' || rawGeometry.type === 'MultiPolygon') {
		// Recover polygons from the raw data.
		layer.data.geoJSON = layer.data.rawGeoJSON;

		// Indicate redrawing layers is required.
		redraw = true;
	} else {
		// Throw an error — the geometry transition is not supported.
		throw new Error('Geometry transition not supported.');
	}

	return {
		targetLayer,
		redraw
	};
}

/**
 * Transition a layer to a choropleth layer.
 *
 * @param map — The top-level MapLibre GL map instance.
 * @param layer — The CartoKit layer to transition.
 *
 * @returns – The transitioned CartoKitChoroplethLayer.
 */
function transitionToChoropleth(map: Map, layer: CartoKitLayer): TransitionMapTypeReturnValue {
	let redraw = false;

	const geometry = layer.data.geoJSON.features[0].geometry;
	const rawGeometry = layer.data.rawGeoJSON.features[0].geometry;

	// If the layer has an attribute visualized, use it. Otherwise, select the first numeric attribute.
	const attribute = isDataLayer(layer)
		? layer.attribute
		: selectNumericAttribute(layer.data.geoJSON.features);

	const targetLayer: CartoKitChoroplethLayer = {
		id: layer.id,
		displayName: layer.displayName,
		type: 'Choropleth',
		data: layer.data,
		attribute,
		style: {
			breaks: {
				scale: 'Quantile',
				colors: DEFAULT_PALETTE
			},
			opacity: layer.style.opacity
		}
	};

	if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
		// Just update the fill color of the existing layer.
		map.setPaintProperty(layer.id, 'fill-color', deriveColorScale(targetLayer));
	} else if (rawGeometry.type === 'Polygon' || rawGeometry.type === 'MultiPolygon') {
		// Recover polygons from the raw data.
		layer.data.geoJSON = layer.data.rawGeoJSON;

		// Indicate redrawing layers is required.
		redraw = true;
	} else {
		// Throw an error — the geometry transition is not supported.
		throw new Error('Geometry transition not supported.');
	}

	return {
		targetLayer,
		redraw
	};
}

/**
 * Transition a layer to a proportional symbol layer.
 *
 * @param map — The top-level MapLibre GL map instance.
 * @param layer — The CartoKit layer to transition.
 *
 * @returns – The transitioned CartoKitProportionalSymbolLayer.
 */
function transitionToProportionalSymbol(
	map: Map,
	layer: CartoKitLayer
): TransitionMapTypeReturnValue {
	let redraw = false;

	const geometry = layer.data.geoJSON.features[0].geometry;
	const features = layer.data.geoJSON.features;

	// If the layer has an attribute visualized, use it. Otherwise, select the first numeric attribute.
	const attribute = isDataLayer(layer) ? layer.attribute : selectNumericAttribute(features);

	const targetLayer: CartoKitProportionalSymbolLayer = {
		...layer,
		type: 'Proportional Symbol',
		attribute,
		style: {
			radius: {
				min: 0,
				max: 100
			},
			opacity: layer.style.opacity
		}
	};

	if (geometry.type === 'Point' || geometry.type === 'MultiPoint') {
		// Just update the radius of the existing layer.
		map.setPaintProperty(layer.id, 'circle-radius', deriveRadii(targetLayer));
	} else {
		redraw = true;

		const centroids = layer.data.geoJSON.features.map((feature) => {
			return turf.feature(turf.centroid(feature).geometry, feature.properties);
		});
		targetLayer.data.geoJSON = turf.featureCollection(centroids);
	}

	return {
		targetLayer,
		redraw
	};
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
