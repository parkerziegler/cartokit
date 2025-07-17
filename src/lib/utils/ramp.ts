import * as d3 from 'd3';

import type { ColorRamp, SchemeDirection } from '$lib/types';

export const COLOR_RAMPS: ColorRamp[] = [
  'Cividis',
  'Viridis',
  'Inferno',
  'Magma',
  'Plasma',
  'Warm',
  'Cool',
  'CubehelixDefault',
  'Turbo',
  'Spectral',
  'Rainbow',
  'Sinebow'
];

/**
 * Materialize a color ramp into an array of colors.
 *
 * @param ramp – The color ramp to materialize.
 * @param rampDirection – The direction of the color ramp.
 * @param n – The number of colors to materialize.
 * @returns An array of colors in hexadecimal format.
 */
export function materializeColorRamp(
  ramp: ColorRamp,
  rampDirection: SchemeDirection,
  n = 256
): string[] {
  const interpolate = d3[`interpolate${ramp}`];
  const colors: string[] = [];

  for (let i = 0; i < n; ++i) {
    colors.push(
      d3
        .rgb(interpolate((rampDirection === 'Forward' ? i : n - i) / (n - 1)))
        .formatHex()
    );
  }

  return colors;
}
