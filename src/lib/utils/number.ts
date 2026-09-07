/**
 * Take the square root of a number, preserving its sign.
 *
 * @param value The input value, e.g., -16.
 * @returns The signed square root of the value, e.g., -4.
 */
export function signedSqrt(value: number): number {
  return Math.sign(value) * Math.sqrt(Math.abs(value));
}

/**
 * Get the square of a number, preserving its sign.
 *
 * @param value The input value, e.g., -4.
 * @returns The signed square of the value, e.g., -16.
 */
export function signedSquare(value: number): number {
  return Math.sign(value) * value * value;
}

/**
 * Convert a percent to a decimal.
 *
 * @param percent The input percent, e.g., 100.
 * @returns The decimal value of the percent between 0 and 1.
 */
export function percentToDecimal(percent: number): number {
  return percent / 100;
}

/**
 * Convert a decimal to a percent string.
 *
 * @param decimal The input decimal value between 0 and 1, e.g., 0.5.
 * @returns The formatted percent string.
 */
export function decimalToPercent(decimal: number): number {
  return decimal * 100;
}
