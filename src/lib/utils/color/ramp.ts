import * as d3 from 'd3';

import type { QuantitativeColorRamp, RampDirection } from '$lib/types';

export const QUANTITATIVE_COLOR_RAMPS: QuantitativeColorRamp[] = [
  // Sequential, single-hue ramps.
  'interpolateBlues',
  'interpolateGreens',
  'interpolateGreys',
  'interpolateOranges',
  'interpolatePurples',
  'interpolateReds',
  // Sequential, multi-hue ramps.
  'interpolateBuGn',
  'interpolateBuPu',
  'interpolateGnBu',
  'interpolateOrRd',
  'interpolatePuBuGn',
  'interpolatePuBu',
  'interpolatePuRd',
  'interpolateRdPu',
  'interpolateYlGnBu',
  'interpolateYlGn',
  'interpolateYlOrBr',
  'interpolateYlOrRd',
  'interpolateCividis',
  'interpolateViridis',
  'interpolateInferno',
  'interpolateMagma',
  'interpolatePlasma',
  'interpolateWarm',
  'interpolateCool',
  'interpolateCubehelixDefault',
  'interpolateTurbo',
  // Diverging ramps.
  'interpolateBrBG',
  'interpolatePRGn',
  'interpolatePiYG',
  'interpolatePuOr',
  'interpolateRdBu',
  'interpolateRdGy',
  'interpolateRdYlBu',
  'interpolateRdYlGn',
  'interpolateSpectral',
  // Cyclical ramps.
  'interpolateRainbow',
  'interpolateSinebow'
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
  ramp: QuantitativeColorRamp,
  rampDirection: RampDirection,
  n = 256
): string[] {
  const interpolate = d3[ramp];
  const colors: string[] = [];

  for (let i = 0; i <= n; i++) {
    colors.push(
      d3
        .rgb(interpolate((rampDirection === 'Forward' ? i : n - i) / n))
        .formatHex()
    );
  }

  return colors;
}
