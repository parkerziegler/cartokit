import type { CartoKitIR } from '$lib/types';

const allAfterEqualRegex = /=.+$/;

/**
 * Generate a MapLibre GL JS program fragment for the map instance's style prop-
 * erty. The style property must be a url to a valid MapLibre GL JS style spec-
 * ification.
 *
 * @param ir – The CartoKit IR.
 * @returns – A MapLibre GL JS program fragment.
 */
export function codegenMapStyle(ir: CartoKitIR): string {
  return `'${ir.basemap.url.replace(
    allAfterEqualRegex,
    '=<YOUR_MAPTILER_API_KEY>'
  )}'`;
}
