// eslint-disable-next-line import/no-unresolved
import { PUBLIC_MAPTILER_API_KEY } from '$env/static/public';
import type { CartoKitIR } from '$lib/stores/ir';

/**
 * Generate a Mapbox GL JS program fragment for the map instance's style property.
 * The style property can be either a url, pointing at a tileset, or a JSON object
 * representing a Mapbox GL JS style specification.
 *
 * @param ir – The CartoKit IR.
 * @returns – A Mapbox GL JS program fragment representing the map's style.
 */
export function codegenMapStyle(ir: CartoKitIR): string {
  return `'${ir.basemap.url.replace(
    PUBLIC_MAPTILER_API_KEY,
    '<YOUR_MAPTILER_API_KEY>'
  )}'`;
}
