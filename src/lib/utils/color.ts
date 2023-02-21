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
