import type { Expression, MapboxGeoJSONFeature } from 'mapbox-gl';
import * as d3 from 'd3';
import { ckmeans } from 'simple-statistics';

import type { CartoKitChoroplethLayer } from '$lib/types/CartoKitLayer';
import { isPropertyNumeric } from '$lib/utils/property';

/**
 * Derive a Mapbox GL JS expression for a choropleth color scale.
 *
 * @param layer – The CartoKit layer to derive a color scale for.
 * @param features – The features in the layer.
 *
 * @returns A Mapbox GL JS expression for a choropleth color scale.
 */
export function deriveColorScale(
	layer: CartoKitChoroplethLayer,
	features: MapboxGeoJSONFeature[]
): Expression {
	const { scale, colors } = layer.style.breaks;

	const prelude: Expression = ['step', ['get', layer.attribute], colors[0]];
	let stops: (string | number)[] = [];

	switch (scale) {
		case 'Quantile':
			stops = deriveQuantileStops(layer, features);
			break;
		case 'Quantize':
			stops = deriveQuantizeStops(layer, features);
			break;
		case 'Jenks':
			stops = deriveJenksStops(layer, features);
			break;
	}

	return [...prelude, ...stops];
}

/**
 * Derive a Mapbox GL JS expression for a quantile color scale.
 *
 * @param layer — The CartoKit layer to derive a quantile color scale for.
 * @param features — The features in the layer.
 *
 * @returns A Mapbox GL JS expression for a quantile color scale.
 */
function deriveQuantileStops(
	layer: CartoKitChoroplethLayer,
	features: MapboxGeoJSONFeature[]
): (string | number)[] {
	const { colors } = layer.style.breaks;

	// For a quantile scale, use the entirety of the data as the domain.
	const data = features.map((feature) => feature.properties?.[layer.attribute]);

	// Derive quantiles.
	const quantiles = d3.scaleQuantile<string>().domain(data).range(colors).quantiles();

	const stops = colors.reduce<(string | number)[]>(
		(acc, color, i) => (i === 0 ? acc : acc.concat([quantiles[i - 1], color])),
		[]
	);

	return stops;
}

/**
 * Derive a Mapbox GL JS expression for a quantize color scale.
 *
 * @param layer – The CartoKit layer to derive a quantize color scale for.
 * @param features – The features in the layer.
 *
 * @returns A Mapbox GL JS expression for a quantize color scale.
 */
function deriveQuantizeStops(
	layer: CartoKitChoroplethLayer,
	features: MapboxGeoJSONFeature[]
): (string | number)[] {
	const { colors } = layer.style.breaks;

	// For a quantize scale, use the extent of the data as the domain.
	const [min, max] = d3.extent(
		features.map((feature) => feature.properties?.[layer.attribute]).filter(isPropertyNumeric)
	);
	const data = typeof min === 'undefined' || typeof max === 'undefined' ? [0, 1] : [min, max];

	// Derive ticks.
	const ticks = d3.scaleQuantize<string>().domain(data).range(colors).nice().ticks(colors.length);

	const stops = colors.reduce<(string | number)[]>(
		(acc, color, i) => (i === 0 ? acc : acc.concat([ticks[i - 1], color])),
		[]
	);

	return stops;
}

/**
 * Derive a Mapbox GL JS expression for a color scale using Jenks natural breaks.
 *
 * @param layer – The CartoKit layer to derive a Jenks color scale for.
 * @param features – The features in the layer.
 *
 * @returns A Mapbox GL JS expression for a Jenks color scale.
 */
function deriveJenksStops(
	layer: CartoKitChoroplethLayer,
	features: MapboxGeoJSONFeature[]
): (string | number)[] {
	const { colors } = layer.style.breaks;

	// For a Jenks scale, use the entirety of the data as the domain.
	const data = features
		.map((feature) => feature.properties?.[layer.attribute])
		.filter(isPropertyNumeric);

	// Derive Jenks breaks using ckmeans clustering.
	const breaks = ckmeans(data, colors.length).map((cluster) => cluster[cluster.length - 1]);

	const stops = colors.reduce<(string | number)[]>(
		(acc, color, i) => (i === 0 ? acc : acc.concat([breaks[i - 1], color])),
		[]
	);

	return stops;
}
