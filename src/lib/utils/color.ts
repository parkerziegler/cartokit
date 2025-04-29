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
