import * as d3 from 'd3';
import type { Feature } from 'geojson';
import { ckmeans } from 'simple-statistics';

import type { ClassificationMethod } from '$lib/types';
import { isPropertyQuantitative } from '$lib/utils/property';

/**
 * Derive the extent for a given attribute of a GeoJSON FeatureCollection.
 *
 * @param attribute – The data attribute to compute the extent over.
 * @param features – The GeoJSON features of the dataset,
 * @returns – The extent of the dataset represented as a tuple.
 */
export function deriveExtent(
  attribute: string,
  features: Feature[]
): [number, number] {
  const [min, max] = d3.extent(
    features
      .map((feature) => feature.properties?.[attribute])
      .filter(isPropertyQuantitative)
  );
  const data: [number, number] =
    typeof min === 'undefined' || typeof max === 'undefined'
      ? [0, 1]
      : [min, max];

  return data;
}

interface DeriveBreaksParams {
  attribute: string;
  features: Feature[];
  range: string[];
}

/**
 * Derive quantiles for a given attribute of a GeoJSON FeatureCollection.
 *
 * @param params — Input parameters to compute quantiles over a GeoJSON FeatureCollection.
 * @param attribute – The data attribute to compute quantiles over.
 * @param features – The GeoJSON features of the dataset.
 * @param range – The output range of the quantile scale.
 *
 * @returns – The quantiles of the dataset.
 */
export function deriveQuantiles({
  attribute,
  features,
  range
}: DeriveBreaksParams): number[] {
  // For a quantile scale, use the entirety of the data as the domain.
  const data = features
    .map((feature) => feature.properties?.[attribute])
    .filter(isPropertyQuantitative);

  // Derive quantiles.
  const quantiles = d3
    .scaleQuantile<string>()
    .domain(data)
    .range(range)
    .quantiles();

  return quantiles;
}

/**
 * Derive equal interval thresholds for a given attribute of a GeoJSON FeatureCollection.
 *
 * @param params — Input parameters to compute equal interval thresholds over a GeoJSON FeatureCollection.
 * @param attribute – The data attribute to compute equal interval thresholds over.
 * @param features – The GeoJSON features of the dataset.
 * @param range – The output range of the equal interval (quantize) scale.
 *
 * @returns – The equal interval thresholds of the dataset.
 */
export function deriveEqualIntervals({
  attribute,
  features,
  range
}: DeriveBreaksParams): number[] {
  // For a quantize scale, use the extent of the data as the domain.
  const [min, max] = deriveExtent(attribute, features);

  // Derive ticks.
  const ticks = d3
    .scaleQuantize<string>()
    .domain([min, max])
    .range(range)
    .thresholds();

  return ticks;
}

/**
 * Derive Jenks natural breaks for a given attribute of a GeoJSON FeatureCollection.
 *
 * @param params — Input parameters to compute Jenks natural breaks over a GeoJSON FeatureCollection.
 * @param attribute – The data attribute to compute Jenks natural breaks over.
 * @param features – The GeoJSON features of the dataset.
 * @param range – The output range of the Jenks scale.
 *
 * @returns – The Jenks natural breaks of the dataset.
 */
export function deriveJenksBreaks({
  attribute,
  features,
  range
}: DeriveBreaksParams): number[] {
  // For a Jenks scale, use the entirety of the data as the domain.
  const data = features
    .map((feature) => feature.properties?.[attribute])
    .filter(isPropertyQuantitative);

  // Derive Jenks breaks using ckmeans clustering.
  const breaks = ckmeans(data, range.length).map(
    (cluster) => cluster[cluster.length - 1]
  );

  // Remove the last break—this corresponds to the max.
  breaks.pop();

  return breaks;
}

interface DeriveThresholdsParams extends DeriveBreaksParams {
  method: ClassificationMethod;
  thresholds: number[];
}

/**
 * Obtain the thresholds for a given attribute of a GeoJSON FeatureCollection.
 *
 * @param params – Input parameters to compute thresholds over a GeoJSON FeatureCollection.
 * @param method – The @see{ClassificationMethod} to use.
 * @param attribute – The data attribute to compute thresholds over.
 * @param features – The GeoJSON features of the dataset.
 * @param range – The output range of the scale.
 * @param thresholds – The thresholds of the dataset, if supplied manually.
 *
 * @returns – The thresholds of the dataset based on the method, attribute, features, and range supplied.
 */
export function deriveThresholds({
  method,
  attribute,
  features,
  range,
  thresholds
}: DeriveThresholdsParams): number[] {
  switch (method) {
    case 'Quantile':
      return deriveQuantiles({ attribute, features, range });
    case 'Equal Interval':
      return deriveEqualIntervals({ attribute, features, range });
    case 'Jenks':
      return deriveJenksBreaks({ attribute, features, range });
    case 'Manual':
      return thresholds;
  }
}
