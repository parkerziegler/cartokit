import type { Map } from 'maplibre-gl';
import * as turf from '@turf/turf';
import type { Feature, FeatureCollection } from 'geojson';

import { deriveColorScale } from '$lib/interaction/color';
import { deriveSize, deriveDotDensityStartingValue } from '$lib/interaction/geometry';
import {
	type CartoKitFillLayer,
	type CartoKitChoroplethLayer,
	type CartoKitProportionalSymbolLayer,
	type CartoKitDotDensityLayer,
	type CartoKitLayer,
	hasAttribute,
	isFillLayer
} from '$lib/types/CartoKitLayer';
import type { MapType } from '$lib/types/MapTypes';
import { randomColor } from '$lib/utils/color';
import { DEFAULT_PALETTE } from '$lib/utils/constants';
import { selectNumericAttribute } from '$lib/utils/geojson';

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
		case 'Dot Density':
			return transitionToDotDensity(map, layer);
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
	const attribute = hasAttribute(layer)
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
	const attribute = hasAttribute(layer) ? layer.attribute : selectNumericAttribute(features);

	const targetLayer: CartoKitProportionalSymbolLayer = {
		...layer,
		type: 'Proportional Symbol',
		attribute,
		style: {
			size: {
				min: 1,
				max: 50
			},
			fill: isFillLayer(layer) ? layer.style.fill : randomColor(),
			opacity: layer.style.opacity
		}
	};

	if (geometry.type === 'Point' || geometry.type === 'MultiPoint') {
		// Just update the radius of the existing layer.
		map.setPaintProperty(layer.id, 'circle-radius', deriveSize(targetLayer));
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
 * Transition a layer to a dot density layer.
 *
 * @param map — The top-level MapLibre GL map instance.
 * @param layer — The CartoKit layer to transition.
 *
 * @returns – The transitioned CartoKitDotDensityLayer.
 */
function transitionToDotDensity(map: Map, layer: CartoKitLayer): TransitionMapTypeReturnValue {
	let redraw = false;

	const geometry = layer.data.geoJSON.features[0].geometry;
	const features = layer.data.geoJSON.features;

	const rawGeometry = layer.data.rawGeoJSON.features[0].geometry;
	const rawFeatures = layer.data.rawGeoJSON.features;

	// If the layer has an attribute visualized, use it. Otherwise, select the first numeric attribute.
	const attribute = hasAttribute(layer) ? layer.attribute : selectNumericAttribute(features);

	const targetLayer: CartoKitDotDensityLayer = {
		...layer,
		type: 'Dot Density',
		attribute,
		style: {
			dots: {
				size: 1,
				value: deriveDotDensityStartingValue(features, attribute)
			},
			fill: isFillLayer(layer) ? layer.style.fill : randomColor(),
			opacity: layer.style.opacity
		}
	};

	if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
		targetLayer.data.geoJSON = generateDotDensityPoints({
			features,
			attribute,
			value: targetLayer.style.dots.value
		});
		redraw = true;
	} else if (rawGeometry.type === 'Polygon' || rawGeometry.type === 'MultiPolygon') {
		targetLayer.data.geoJSON = generateDotDensityPoints({
			features: rawFeatures,
			attribute,
			value: targetLayer.style.dots.value
		});
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

interface GenerateDotDensityPointsParams {
	features: Feature[];
	attribute: string;
	value: number;
}

/**
 * Generate dots for a dot density layer.
 *
 * @param features – the polygon features within which to generate dots.
 * @param attribute – the attribute being visualized.
 * @param value – the value of dots to attribute value.
 *
 * @returns – a FeatureCollection of dots.
 */
function generateDotDensityPoints({
	features,
	attribute,
	value
}: GenerateDotDensityPointsParams): FeatureCollection {
	const dots = features.flatMap((feature) => {
		const numPoints = Math.floor(feature.properties?.[attribute] / value) ?? 0;

		// Obtain the bounding box of the polygon.
		const bbox = turf.bbox(feature);

		// Generate numPoints random points within the bounding box.
		const points = turf.randomPoint(numPoints, { bbox });

		return points.features.flatMap((point) => {
			return turf.feature(point.geometry, feature.properties);
		});
	});

	return turf.featureCollection(dots);
}
