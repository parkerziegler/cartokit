/**
 * Pluralize a noun based on a number.
 *
 * @param n – The number to base the pluralization on.
 * @param noun – The noun to pluralize.
 * @param suffix – The pluralization suffix.
 * @returns – The pluralized noun, if necessary.
 */
export function pluralize(noun: string, n: number, suffix = 's'): string {
  return n === 1 ? noun : `${noun}${suffix}`;
}
