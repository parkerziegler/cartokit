import type {
  QuantitativeColorScheme,
  QuantitativeColorRamp
} from '$lib/types';
import { QUANTITATIVE_COLOR_SCHEMES } from '$lib/utils/color/scheme';
import { DEFAULT_QUANTITATIVE_SCHEME } from '$lib/utils/constants';

/**
 * Convert a {@link QuantitativeColorScheme} to a {@link QuantitativeColorRamp}.
 *
 * @param scheme The {@link QuantitativeColorScheme} to convert.
 * @returns The {@link QuantitativeColorRamp} equivalent.
 */
export function convertSchemeToRamp(
  scheme: QuantitativeColorScheme
): QuantitativeColorRamp {
  return scheme.replace('scheme', 'interpolate') as QuantitativeColorRamp;
}

/**
 * Convert a {@link QuantitativeColorRamp} to a {@link QuantitativeColorScheme}.
 *
 * @param ramp The {@link QuantitativeColorRamp} to convert.
 * @returns The {@link QuantitativeColorScheme} equivalent.
 */
export function convertRampToScheme(
  ramp: QuantitativeColorRamp
): QuantitativeColorScheme {
  const id = ramp.replace('interpolate', 'scheme');

  if (QUANTITATIVE_COLOR_SCHEMES.includes(id as QuantitativeColorScheme)) {
    return id as QuantitativeColorScheme;
  }

  return DEFAULT_QUANTITATIVE_SCHEME;
}
