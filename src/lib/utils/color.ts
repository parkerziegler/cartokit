import * as d3 from 'd3';

import type {
  CategoricalColorScheme,
  QuantitativeColorScheme
} from '$lib/types';

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
 * @param {number} percent – The input percent, e.g., 100.
 * @returns – The decimal value of the percent between 0 and 1.
 */
export function percentToDecimal(percent: number): number {
  return percent / 100;
}

/**
 * Convert a decimal to a percent string.
 *
 * @param {number} decimal – The input decimal value between 0 and 1, e.g., 0.5.
 * @returns – The formatted percent string.
 */
export function decimalToPercent(decimal: number): number {
  return decimal * 100;
}

/**
 * Reverse a quantitative color scheme.
 *
 * @param {QuantitativeColorScheme} scheme – The quantitative color scheme to reverse.
 * @returns – The reversed quantitative color scheme.
 */
export function reverseQuantitativeColorScheme(
  scheme: QuantitativeColorScheme
): QuantitativeColorScheme {
  return scheme.map((indexedScheme) => [...indexedScheme].reverse());
}

/**
 * Reverse a categorical color scheme.
 *
 * @param  {CategoricalColorScheme} scheme – The categorical color scheme to reverse.
 * @returns – The reversed categorical color scheme.
 */
export function reverseCategoricalColorScheme(
  scheme: CategoricalColorScheme
): CategoricalColorScheme {
  return [...scheme].reverse();
}

export const QUANTITATIVE_COLOR_SCHEMES = [
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
export const QUANTITATIVE_COLOR_SCHEMES_REV = QUANTITATIVE_COLOR_SCHEMES.map(
  reverseQuantitativeColorScheme
);

export const CATEGORICAL_COLOR_SCHEMES: CategoricalColorScheme[] = [
  d3.schemeCategory10,
  d3.schemeAccent,
  d3.schemeDark2,
  /* eslint-disable import/namespace */
  // @ts-expect-error – d3.schemeObservable10 not yet added to @types/d3
  d3.schemeObservable10,
  /* eslint-enable import/namespace */
  d3.schemePaired,
  d3.schemePastel1,
  d3.schemePastel2,
  d3.schemeSet1,
  d3.schemeSet2,
  d3.schemeSet3,
  d3.schemeTableau10
];
export const CATEGORICAL_COLOR_SCHEMES_REV = CATEGORICAL_COLOR_SCHEMES.map(
  reverseCategoricalColorScheme
);

/**
 * Generate a hexademical color with an alpha channel.
 *
 * @param {string} hex – The hexademical color.
 * @param {number} opacity – The opacity value, between 0 and 1.
 * @returns {string} – An eight-character hexademical color string.
 */
export function hexWithOpacity(hex: string, opacity: number): string {
  const opacityHex = Math.round(opacity * 255).toString(16);

  return `${hex}${opacityHex}`;
}
