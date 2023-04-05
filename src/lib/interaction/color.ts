import type { ExpressionSpecification } from 'maplibre-gl';
import * as d3 from 'd3';
import { ckmeans } from 'simple-statistics';
import type { Feature } from 'geojson';

import type { CartoKitChoroplethLayer } from '$lib/types/CartoKitLayer';
import { isPropertyNumeric } from '$lib/utils/property';

/**
 * Derive a MapLibre GL JS expression for a choropleth color scale.
 *
 * @param layer – The CartoKit layer to derive a color scale for.
 * @param features – The features in the layer.
 *
 * @returns A MapLibre GL JS expression for a choropleth color scale.
 */
export function deriveColorScale(
  layer: CartoKitChoroplethLayer
): ExpressionSpecification {
  const {
    attribute,
    data: {
      geoJSON: { features }
    },
    style: {
      breaks: { scale, scheme, count }
    }
  } = layer;

  const colors = scheme[count].slice();

  const prelude: ExpressionSpecification = [
    'step',
    ['get', layer.attribute],
    colors[0]
  ];
  let stops: (string | number)[] = [];

  switch (scale) {
    case 'Quantile':
      stops = deriveQuantileStops({ attribute, features, colors });
      break;
    case 'Quantize':
      stops = deriveQuantizeStops({ attribute, features, colors });
      break;
    case 'Jenks':
      stops = deriveJenksStops({ attribute, features, colors });
      break;
  }

  return [...prelude, ...stops];
}

interface DeriveStopsParams {
  attribute: string;
  features: Feature[];
  colors: string[];
}

/**
 * Derive a MapLibre GL JS expression for a quantile color scale.
 *
 * @param attribute — The attribute to use when derviving the quantile color scale.
 * @param features — The features in the layer.
 * @param colors — The colors to use in the color scale.
 *
 * @returns A MapLibre GL JS expression for a quantile color scale.
 */
function deriveQuantileStops({
  attribute,
  features,
  colors
}: DeriveStopsParams): (string | number)[] {
  // For a quantile scale, use the entirety of the data as the domain.
  const data = features
    .map((feature) => feature.properties?.[attribute])
    .filter(isPropertyNumeric);

  // Derive quantiles.
  const quantiles = d3
    .scaleQuantile<string>()
    .domain(data)
    .range(colors)
    .quantiles();
  const stops = buildStops(colors, quantiles);

  return stops;
}

/**
 * Derive a MapLibre GL JS expression for a quantize color scale.
 *
 * @param layer – The CartoKit layer to derive a quantize color scale for.
 *
 * @returns A MapLibre GL JS expression for a quantize color scale.
 */
function deriveQuantizeStops({
  attribute,
  features,
  colors
}: DeriveStopsParams): (string | number)[] {
  // For a quantize scale, use the extent of the data as the domain.
  const [min, max] = d3.extent(
    features
      .map((feature) => feature.properties?.[attribute])
      .filter(isPropertyNumeric)
  );
  const data =
    typeof min === 'undefined' || typeof max === 'undefined'
      ? [0, 1]
      : [min, max];

  // Derive ticks.
  const ticks = d3
    .scaleQuantize<string>()
    .domain(data)
    .range(colors)
    .nice()
    .ticks(colors.length);
  const stops = buildStops(colors, ticks);

  return stops;
}

/**
 * Derive a MapLibre GL JS expression for a color scale using Jenks natural breaks.
 *
 * @param layer – The CartoKit layer to derive a Jenks color scale for.
 *
 * @returns A MapLibre GL JS expression for a Jenks color scale.
 */
function deriveJenksStops({
  attribute,
  features,
  colors
}: DeriveStopsParams): (string | number)[] {
  // For a Jenks scale, use the entirety of the data as the domain.
  const data = features
    .map((feature) => feature.properties?.[attribute])
    .filter(isPropertyNumeric);

  // Derive Jenks breaks using ckmeans clustering.
  const breaks = ckmeans(data, colors.length).map(
    (cluster) => cluster[cluster.length - 1]
  );
  const stops = buildStops(colors, breaks);

  return stops;
}

/**
 * Construct the stops portion of a MapLibre GL JS step expression.
 *
 * @param colors – the colors to use in the expression.
 * @param stops – the stops (breaks) to use in the expression.
 *
 * @returns – the stops portion of a MapLibre GL JS step expression.
 */
function buildStops(colors: string[], stops: number[]): (string | number)[] {
  return colors.reduce<(string | number)[]>(
    (acc, color, i) => (i === 0 ? acc : acc.concat([stops[i - 1], color])),
    []
  );
}
