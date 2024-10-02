import * as d3 from 'd3';
import type { Feature } from 'geojson';
import { get } from 'svelte/store';

import { catalog } from '$lib/stores/catalog';
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
 *
 * @returns – The quantiles of the dataset.
 */
function deriveQuantiles({
  layerId,
  attribute,
  range
}: DeriveBreaksParams): number[] {
  const ctlg = get(catalog);
  const domain = ctlg[layerId][attribute]['Quantile'].domain;

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
 *
 * @returns – The equal interval thresholds of the dataset.
 */
function deriveEqualIntervals({
  layerId,
  attribute,
  range
}: DeriveBreaksParams): number[] {
  const ctlg = get(catalog);
  const domain = ctlg[layerId][attribute]['Equal Interval'].domain;

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
 *
 * @returns – The Jenks natural breaks of the dataset.
 */
function deriveJenksBreaks({
  layerId,
  attribute,
  range
}: DeriveBreaksParams): number[] {
  const ctlg = get(catalog);

  return ctlg[layerId][attribute]['Jenks'][range.length].breaks;
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
    case 'Manual':
      return thresholds;
  }
}
