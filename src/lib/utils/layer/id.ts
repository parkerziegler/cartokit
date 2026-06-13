/**
 * Get the canonical layerId for a {@link CartoKitLayer}.
 *
 * @param layerId The id of the {@link CartoKitLayer} to canonicalize.
 * @returns The canonical layerId, with any suffixes (e.g. "-outlines", "-points") removed.
 */
export function getCanonicalLayerId(layerId: string): string {
  return layerId.replace(/-outlines|-points/g, '');
}
