/**
 * Pluralize a noun based on a number.
 *
 * @param n The number to base the pluralization on.
 * @param noun The noun to pluralize.
 * @param suffix The pluralization suffix.
 * @returns The pluralized noun, if necessary.
 */
export function pluralize(noun: string, n: number, suffix = 's'): string {
  return n === 1 ? noun : `${noun}${suffix}`;
}

/**
 * Conjugate a verb depending on a count.
 *
 * @param verb The verb to conjugate.
 * @param n The number to base the conjugation on.
 */
export function conjugate(verb: string, n: number) {
  return n === 1 ? `${verb}s` : verb;
}
