import { isFinite } from 'lodash-es';

/**
 * Determine if a GeoJSON property is quantitative. We exclude `NaN` and
 * `Infinity` as valid because it's extremely unlikely for these values to have
 * practical uses in GeoJSON datasets.
 *
 * @param {unknown} property – The property to check.
 * @returns – A Boolean value indicating whether the property is finite and
 * quantitative.
 */
export function isPropertyQuantitative(property: unknown): property is number {
  return isFinite(property);
}

/**
 * Determine if a GeoJSON property is categorical. We assume any string property
 * is categorical.
 *
 * @param property — The property to check.
 * @returns — A Boolean value indicating whether the property is categorical.
 */
export function isPropertyCategorical(property: unknown): property is string {
  return typeof property === 'string';
}
