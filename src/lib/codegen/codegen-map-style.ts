import type { CartoKitIR } from '$lib/types';

const allAfterEqualRegex = /=.+$/;

/**
 * Generate a program fragment for the map instance's style property. The style
 * property must be a url to a valid MapLibre GL JS style specification.
 *
 * @param ir – The {@link CartoKitIR}.
 * @returns – A program fragment containing the URL of the map style.
 */
export function codegenMapStyle(ir: CartoKitIR): string {
  return `'${ir.basemap.url.replace(
    allAfterEqualRegex,
    '=<YOUR_MAPTILER_API_KEY>'
  )}'`;
}
