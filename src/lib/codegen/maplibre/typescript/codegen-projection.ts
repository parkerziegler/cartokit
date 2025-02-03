import type { CartoKitIR } from '$lib/types';

/**
 * Generate a MapLibre GL JS program fragment for the map's projection.
 *
 * @param ir – The CartoKit IR.
 * @returns – A MapLibre GL JS program fragment.
 */
export function codegenProjection(ir: CartoKitIR): string {
  if (ir.projection === 'globe') {
    return `
      map.on('style.load', () => {
        map.setProjection({ type: 'globe' });
      });
    `;
  }

  return '';
}
