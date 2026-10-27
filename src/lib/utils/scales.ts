import * as d3 from 'd3';
import { ckmeans } from 'simple-statistics';

/**
 * Derive quantiles for a given attribute and number of breaks k.
 *
 * @param domain The data attribute to compute quantiles over.
 * @param k The output range of the quantile scale.
 * @returns The quantiles of the dataset.
 */
export function deriveQuantiles(domain: number[], k: number): number[] {
  if (domain.length === 0) {
    return [];
  }

  const quantiles = d3
    .scaleQuantile<number>()
    .domain(domain)
    .range(new Array(k).fill(undefined).map((_, i) => i))
    .quantiles();

  return quantiles;
}

/**
 * Derive equal interval thresholds for a given attribute and number of breaks k.
 *
 * @param params Input parameters to compute equal interval thresholds over a GeoJSON FeatureCollection.
 * @param layerId The ID of the visualized layer.
 * @param attribute The data attribute to compute equal interval thresholds over.
 * @param range The output range of the equal interval (quantize) scale.
 * @returns The equal interval thresholds of the dataset.
 */
export function deriveEqualIntervals(
  min: number,
  max: number,
  k: number
): number[] {
  const ticks = d3
    .scaleQuantize<number>()
    .domain([min, max])
    .range(new Array(k).fill(undefined).map((_, i) => i))
    .thresholds();

  return ticks;
}

/**
 * Derive Jenks natural breaks for a given attribute of a GeoJSON FeatureCollection.
 *
 * @param params Input parameters to compute Jenks natural breaks over a GeoJSON FeatureCollection.
 * @param layerId The ID of the visualized layer.
 * @param attribute The data attribute to compute Jenks natural breaks over.
 * @param range The output range of the Jenks scale.
 * @returns The Jenks natural breaks of the dataset.
 */
export function deriveJenksBreaks(domain: number[], k: number): number[] {
  if (domain.length < k) {
    return [];
  }

  const breaks = ckmeans(domain, k).map(
    (cluster) => cluster[cluster.length - 1]
  );
  // Remove the last break—this corresponds to the max.
  breaks.pop();

  return breaks;
}
