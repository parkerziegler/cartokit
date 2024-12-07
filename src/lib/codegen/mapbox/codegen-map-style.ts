import type { CartoKitIR } from '$lib/types';

const allAfterEqualRegex = /=.+$/;

/**
 * Generate a Mapbox GL JS program fragment for the map instance's style prop-
 * erty. The style property must be a url to a valid Mapbox GL JS style spec-
 * ification.
 *
 * @param ir – The CartoKit IR.
 * @returns – A url to a valid Mapbox GL JS style specification.
 */
export function codegenMapStyle(ir: CartoKitIR): string {
  return `'${ir.basemap.url.replace(
    allAfterEqualRegex,
    '=<YOUR_MAPTILER_API_KEY>'
  )}'`;
}
