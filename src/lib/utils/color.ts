/**
 * Convert a number in the range 0-255 to a hex value.
 *
 * @param c – The number to convert.
 * @returns – The hexademical value of the number.
 */
function componentToHex(c: number): string {
	const hex = c.toString(16);
	return hex.length == 1 ? '0' + hex : hex;
}

/**
 * Convert an RGB color to a hex value.
 *
 * @param r – The red component of the color.
 * @param g – The green component of the color.
 * @param b – The blue component of the color.
 * @returns – The hexademical value of the color.
 */
export function rgbToHex(r: number, g: number, b: number) {
	return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`.toUpperCase();
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
