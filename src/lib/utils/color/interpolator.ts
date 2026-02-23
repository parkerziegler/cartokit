import * as d3 from 'd3';

import type {
  QuantitativeColorInterpolator,
  InterpolatorDirection
} from '$lib/types';

export const QUANTITATIVE_COLOR_INTERPOLATORS: QuantitativeColorInterpolator[] = [
  // Sequential interpolators.
  'interpolatorBlues',
  'interpolatorGreens',
  'interpolatorGreys',
  'interpolatorOranges',
  'interpolatorPurples',
  'interpolatorReds',
  'interpolatorBuGn',
  'interpolatorBuPu',
  'interpolatorGnBu',
  'interpolatorOrRd',
  'interpolatorPuBuGn',
  'interpolatorPuBu',
  'interpolatorPuRd',
  'interpolatorYlGnBu',
  'interpolatorYlGn',
  'interpolatorYlOrBr',
  'interpolatorYlOrRd',
  // Diverging interpolators.
  'interpolatorBrBG',
  'interpolatorPRGn',
  'interpolatorPiYG',
  'interpolatorPuOr',
  'interpolatorRdBu',
  'interpolatorRdGy',
  'interpolatorRdYlBu',
  'interpolatorRdYlGn',
  'interpolatorSpectral'
];

/**
 * Materialize a color interpolator into a continuous interpolation function.
 *
 * @param interpolator A @link{QuantitativeColorInterpolator}.
 * @param direction The @link{InterpolatorDirection} of the interpolator.
 * @returns A function that takes a value between 0 and 1 and returns a color in hexadecimal format.
 */
export function materializeColorInterpolator(
  interpolator: QuantitativeColorInterpolator,
  direction: InterpolatorDirection
): (t: number) => string {
  const interpolateFn = d3[interpolator];

  return (t: number) => {
    const normalizedT = direction === 'Reverse' ? 1 - t : t;
    return d3.rgb(interpolateFn(normalizedT)).formatHex();
  };
}
