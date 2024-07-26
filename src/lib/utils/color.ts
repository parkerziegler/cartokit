import * as d3 from 'd3';

import type { ColorScheme } from '$lib/types';

/**
 * Generate a random color in hexademical format.
 *
 * @returns - a random color in hexademical format.
 */
export function randomColor(): string {
  const candidate = Math.floor(Math.random() * 16777215).toString(16);

  return '#000000'.slice(0, -candidate.length) + candidate;
}

/**
 * Convert a percent to a decimal.
 *
 * @param percent – The input percent, e.g., 100.
 * @returns – The decimal value of the percent between 0 and 1.
 */
export function percentToDecimal(percent: number): number {
  return percent / 100;
}

/**
 * Convert a decimal to a percent string.
 *
 * @param decimal – The input decimal value between 0 and 1, e.g., 0.5.
 * @returns – The formatted percent string.
 */
export function decimalToPercent(decimal: number): number {
  return decimal * 100;
}

/**
 * Reverse a color scheme.
 *
 * @param scheme – The color scheme to reverse.
 * @returns – The reversed color scheme.
 */
export function reverseColorScheme(scheme: ColorScheme): ColorScheme {
  if (Array.isArray(scheme)) {
    return scheme.map((indexedScheme) => [...indexedScheme].reverse());
  }

  return scheme;
}

export const COLOR_SCHEMES = [
  // Sequential schemes.
  d3.schemeBlues,
  d3.schemeGreens,
  d3.schemeGreys,
  d3.schemeOranges,
  d3.schemePurples,
  d3.schemeReds,
  d3.schemeBuGn,
  d3.schemeBuPu,
  d3.schemeGnBu,
  d3.schemeOrRd,
  d3.schemePuBuGn,
  d3.schemePuBu,
  d3.schemePuRd,
  d3.schemeRdPu,
  d3.schemeYlGnBu,
  d3.schemeYlGn,
  d3.schemeYlOrBr,
  d3.schemeYlOrRd,
  // Diverging schemes.
  d3.schemeBrBG,
  d3.schemePRGn,
  d3.schemePiYG,
  d3.schemePuOr,
  d3.schemeRdBu,
  d3.schemeRdGy,
  d3.schemeRdYlBu,
  d3.schemeRdYlGn,
  d3.schemeSpectral
];
export const COLOR_SCHEMES_REV = COLOR_SCHEMES.map(reverseColorScheme);
