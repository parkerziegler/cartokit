import * as d3 from 'd3';

export const QUANTITATIVE_COLOR_RAMPS = [
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
] as const;

/**
 * Represents a quantitative D3 color scheme.
 */
export type QuantitativeColorRamp = (typeof QUANTITATIVE_COLOR_RAMPS)[number];

/**
 * Represents the direction of a color ramp.
 */
export type RampDirection = 'Forward' | 'Reverse';

/**
 * Materialize a {@link QuantitativeColorRamp} into an array of colors.
 *
 * @param ramp The {@link QuantitativeColorRamp} to materialize.
 * @param rampDirection The {@link RampDirection} of the color ramp.
 * @param n The number of colors to materialize.
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
