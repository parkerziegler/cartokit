import type { CartoKitIR } from '$lib/types';

const allAfterEqualRegex = /=.+$/;

/**
 * Generate a Mapbox GL JS program fragment, in TypeScript, for the map
 * instance's style property. The style property must be a url to a valid Mapbox
 * GL JS style specification.
 *
 * @param ir – The CartoKit IR.
 * @returns – A Mapbox GL JS program fragment, in TypeScript.
 */
export function codegenMapStyle(ir: CartoKitIR): string {
  return `'${ir.basemap.url.replace(
    allAfterEqualRegex,
    '=<YOUR_MAPTILER_API_KEY>'
  )}'`;
}
