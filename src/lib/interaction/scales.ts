import * as d3 from 'd3';

import { catalog } from '$lib/state/catalog.svelte';
import type { ClassificationMethod } from '$lib/types';

interface DeriveBreaksParams {
  layerId: string;
  attribute: string;
  range: string[];
}

/**
 * Derive quantiles for a given attribute of a GeoJSON FeatureCollection.
 *
 * @param params — Input parameters to compute quantiles over a GeoJSON FeatureCollection.
 * @param layerId – The ID of the visualized layer.
 * @param attribute – The data attribute to compute quantiles over.
 * @param range – The output range of the quantile scale.
 * @returns – The quantiles of the dataset.
 */
function deriveQuantiles({
  layerId,
  attribute,
  range
}: DeriveBreaksParams): number[] {
  const domain = catalog.value[layerId][attribute]['Quantile'].domain;

  // Derive quantiles.
  const quantiles = d3
    .scaleQuantile<string>()
    .domain(domain)
    .range(range)
    .quantiles();

  return quantiles;
}

/**
 * Derive equal interval thresholds for a given attribute of a GeoJSON FeatureCollection.
 *
 * @param params — Input parameters to compute equal interval thresholds over a GeoJSON FeatureCollection.
 * @param layerId – The ID of the visualized layer.
 * @param attribute – The data attribute to compute equal interval thresholds over.
 * @param range – The output range of the equal interval (quantize) scale.
 * @returns – The equal interval thresholds of the dataset.
 */
function deriveEqualIntervals({
  layerId,
  attribute,
  range
}: DeriveBreaksParams): number[] {
  const domain = catalog.value[layerId][attribute]['Equal Interval'].domain;

  // Derive ticks.
  const ticks = d3
    .scaleQuantize<string>()
    .domain(domain)
    .range(range)
    .thresholds();

  return ticks;
}

/**
 * Derive Jenks natural breaks for a given attribute of a GeoJSON FeatureCollection.
 *
 * @param params — Input parameters to compute Jenks natural breaks over a GeoJSON FeatureCollection.
 * @param layerId – The ID of the visualized layer.
 * @param attribute – The data attribute to compute Jenks natural breaks over.
 * @param range – The output range of the Jenks scale.
 * @returns – The Jenks natural breaks of the dataset.
 */
function deriveJenksBreaks({
  layerId,
  attribute,
  range
}: DeriveBreaksParams): number[] {
  return catalog.value[layerId][attribute]['Jenks'][range.length].breaks;
}

/**
 * Derive JeCkmeansnks natural breaks for a given attribute of a GeoJSON FeatureCollection.
 *
 * @param params — Input parameters to compute Ckmeans natural breaks over a GeoJSON FeatureCollection.
 * @param layerId – The ID of the visualized layer.
 * @param attribute – The data attribute to compute Ckmeans natural breaks over.
 * @param range – The output range of the Ckmeans scale.
 * @returns – The Ckmeans breaks of the dataset.
 */
function deriveCkmeansBreaks({
  layerId,
  attribute,
  range
}: DeriveBreaksParams): number[] {
  return catalog.value[layerId][attribute]['Ckmeans'][range.length].breaks;
}

/**
 * Derive manual thresholds for a given attribute of a GeoJSON FeatureCollection.
 *
 * @param params – Input parameters to compute manual thresholds over a GeoJSON FeatureCollection.
 * @param layerId – The ID of the visualized layer.
 * @param attribute – The data attribute to compute manual thresholds over.
 * @param range – The output range of the scale.
 * @param thresholds – The current thresholds of the dataset.
 * @returns – The (potentially updated) manual thresholds of the dataset.
 */
function deriveManualBreaks({
  layerId,
  attribute,
  range,
  thresholds
}: DeriveBreaksParams & { thresholds: number[] }): number[] {
  // If the number of thresholds does not match the number of range values,
  // derive a fully new set of thresholds, defaulting to quantiles.
  if (thresholds.length !== range.length - 1) {
    const quantiles = deriveQuantiles({ layerId, attribute, range });

    return quantiles;
  }

  return forceAscendingThresholds({ layerId, attribute, thresholds });
}

/**
 * Force ascending thresholds.
 *
 * @param params – Input parameters to force ascending thresholds.
 * @param layerId – The ID of the visualized layer.
 * @param attribute – The data attribute to force ascending thresholds over.
 * @param thresholds – The current thresholds of the dataset.
 * @returns – The (potentially updated) ascending thresholds of the dataset.
 */
function forceAscendingThresholds({
  layerId,
  attribute,
  thresholds
}: Omit<DeriveBreaksParams, 'range'> & { thresholds: number[] }): number[] {
  const min = catalog.value[layerId][attribute]['min'];
  const max = catalog.value[layerId][attribute]['max'];

  let prev = min;
  const output: number[] = [];

  thresholds.forEach((threshold) => {
    if (threshold <= prev) {
      // Get a random value between the previous threshold and the max.
      threshold = d3.randomUniform(prev, max)();
    } else if (threshold > max) {
      threshold = max - 0.00001;
    }

    output.push(threshold);
    prev = threshold;
  });

  return output;
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
 * @param layerId – The ID of the visualized layer.
 * @param attribute – The data attribute to compute thresholds over.layerId,
 * @param range – The output range of the scale.
 * @param thresholds – The thresholds of the dataset, if supplied manually.
 *
 * @returns – The thresholds of the dataset based on the method, attribute, features, and range supplied.
 */
export function deriveThresholds({
  method,
  layerId,
  attribute,
  range,
  thresholds
}: DeriveThresholdsParams): number[] {
  switch (method) {
    case 'Quantile':
      return deriveQuantiles({ layerId, attribute, range });
    case 'Equal Interval':
      return deriveEqualIntervals({ layerId, attribute, range });
    case 'Jenks':
      return deriveJenksBreaks({ layerId, attribute, range });
    case 'Ckmeans':
      return deriveCkmeansBreaks({ layerId, attribute, range });
    case 'Manual':
      return deriveManualBreaks({ layerId, attribute, range, thresholds });
  }
}
