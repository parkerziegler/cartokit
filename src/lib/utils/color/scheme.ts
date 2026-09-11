import * as d3 from 'd3';

/**
 * The quantitative D3 color schemes available in cartokit, in display order.
 */
export const QUANTITATIVE_COLOR_SCHEMES = [
  // Sequential, single-hue schemes.
  'schemeBlues',
  'schemeGreens',
  'schemeGreys',
  'schemeOranges',
  'schemePurples',
  'schemeReds',
  // Sequential, multi-hue schemes.
  'schemeBuGn',
  'schemeBuPu',
  'schemeGnBu',
  'schemeOrRd',
  'schemePuBuGn',
  'schemePuBu',
  'schemePuRd',
  'schemeRdPu',
  'schemeYlGnBu',
  'schemeYlGn',
  'schemeYlOrBr',
  'schemeYlOrRd',
  // Diverging schemes.
  'schemeBrBG',
  'schemePRGn',
  'schemePiYG',
  'schemePuOr',
  'schemeRdBu',
  'schemeRdGy',
  'schemeRdYlBu',
  'schemeRdYlGn',
  'schemeSpectral'
] as const;

/**
 * Represents a quantitative D3 color scheme.
 */
export type QuantitativeColorScheme =
  (typeof QUANTITATIVE_COLOR_SCHEMES)[number];

/**
 * The categorical D3 color schemes available in cartokit, in display order.
 */
export const CATEGORICAL_COLOR_SCHEMES = [
  'schemeCategory10',
  'schemeAccent',
  'schemeDark2',
  'schemeObservable10',
  'schemePaired',
  'schemePastel1',
  'schemePastel2',
  'schemeSet1',
  'schemeSet2',
  'schemeSet3',
  'schemeTableau10'
] as const;

/**
 * Represents a categorical D3 color scheme.
 */
export type CategoricalColorScheme = (typeof CATEGORICAL_COLOR_SCHEMES)[number];

/**
 * Represents the direction of a color scheme.
 */
export type SchemeDirection = 'Forward' | 'Reverse';

/**
 * A type guard to narrow a scheme to a {@link QuantitativeColorScheme}.
 *
 * @param scheme The name of the scheme to test.
 * @returns A Boolean flag indicating whether the scheme is a
 * {@link QuantitativeColorScheme}.
 */
export function isQuantitativeColorScheme(
  scheme: string
): scheme is QuantitativeColorScheme {
  return QUANTITATIVE_COLOR_SCHEMES.includes(scheme as QuantitativeColorScheme);
}

/**
 * Materialize a quantitative color scheme into an array of colors.
 *
 * @param scheme A {@link QuantitativeColorScheme}.
 * @param direction The {@link SchemeDirection} of the scheme.
 * @param count The number of colors in the color scale.
 * @returns An array of colors in hexadecimal format.
 */
function materializeQuantitativeColorScheme(
  scheme: QuantitativeColorScheme,
  direction: SchemeDirection,
  count: number
): string[] {
  const colors = d3[scheme][count];

  return direction === 'Reverse' ? [...colors].reverse() : [...colors];
}

/**
 * Materialize a categorical color scheme into an array of colors.
 *
 * @param scheme A @link{CategoricalColorScheme}.
 * @param direction The @link{SchemeDirection} of the scheme.
 * @returns An array of colors in hexadecimal format.
 */
function materializeCategoricalColorScheme(
  scheme: CategoricalColorScheme,
  direction: SchemeDirection
): string[] {
  const colors = d3[scheme];

  return direction === 'Reverse' ? [...colors].reverse() : [...colors];
}

/**
 * Materialize a color scheme into an array of colors.
 *
 * @param scheme A @link{CategoricalColorScheme} or @link{QuantitativeColorScheme}.
 * @param direction The @link{SchemeDirection} of the scheme.
 * @param count The number of colors in the color scale.
 * @returns An array of colors in hexadecimal format.
 */
export function materializeColorScheme(
  scheme: CategoricalColorScheme | QuantitativeColorScheme,
  direction: SchemeDirection,
  count = 0
): string[] {
  return isQuantitativeColorScheme(scheme)
    ? materializeQuantitativeColorScheme(scheme, direction, count)
    : materializeCategoricalColorScheme(scheme, direction);
}
