import type { ColorScheme } from '$lib/types/color';

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
 * Reverse a D3 color scheme.
 *
 * @param scheme – The D3 color scheme to reverse.
 * @returns – The reversed D3 color scheme.
 */
export function reverseD3ColorScheme(scheme: ColorScheme) {
  const revScheme = scheme.map((indexedScheme) => {
    const revIndexedScheme = [...indexedScheme].reverse();

    return revIndexedScheme;
  });

  return revScheme;
}
