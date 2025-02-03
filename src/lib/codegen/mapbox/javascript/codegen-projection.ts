import type { CartoKitIR } from '$lib/types';

/**
 * Generate a Mapbox GL JS program fragment for the map projection.
 *
 * @param ir – The CartoKit IR.
 * @returns – A Mapbox GL JS program fragment.
 */
export function codegenProjection(ir: CartoKitIR): string {
  return ir.projection === 'globe' ? 'projection: "globe"' : '';
}
