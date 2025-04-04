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
