import isFinite from 'lodash.isfinite';

/**
 * Determine if a GeoJSON property is numeric. We exclude `NaN` and `Infinity` as
 * valid because it's extremely unlikely for these values to have practical uses
 * in GeoJSON datasets.
 *
 * @param property – The property to check.
 *
 * @returns – a Boolean value indicating whether the property is finite and numeric.
 */
export function isPropertyNumeric(property: unknown): property is number {
  return isFinite(property);
}
