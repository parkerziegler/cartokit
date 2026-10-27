/**
 * Get the extension of a file name or path, mirroring the semantics of Node's
 * `path.extname`.
 *
 * The extension runs from the last `.` in the final path segment to the end of
 * the string. An empty string is returned if there is no `.`, or if the only
 * `.` is the first character of the segment (e.g., `.gitignore`).
 *
 * @param name The file name or path.
 * @returns The extension, including the leading `.`, or an empty string.
 */
export function extname(name: string): string {
  const base = name.replace(/\/+$/, '').split('/').pop() ?? '';

  if (base === '..') {
    return '';
  }

  const dot = base.lastIndexOf('.');
  return dot > 0 ? base.slice(dot) : '';
}
