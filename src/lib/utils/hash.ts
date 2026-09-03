/**
 * Compute a 32-bit FNV-1a hash of a string, returned as a base-36 string.
 *
 * This is a non-cryptographic hash chosen for speed: it runs synchronously
 * in a single pass over the string, unlike `crypto.subtle.digest`, which is
 * async and orders of magnitude slower for short strings like prompts.
 */
export function hash(input: string): string {
  // FNV offset basis for 32 bits.
  let h = 0x811c9dc5;

  for (let i = 0; i < input.length; i++) {
    // Bitwise XOR assignment.
    h ^= input.charCodeAt(i);

    // 32-bit integer multiplication with wraparound.
    h = Math.imul(h, 0x01000193);
  }

  return (h >>> 0).toString(36);
}
