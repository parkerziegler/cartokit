import type { CartoKitBackend, CartoKitIR } from '$lib/types';

/**
 * Generate a program fragment for the map's projection.
 * projection.
 *
 * @param ir – The CartoKit IR.
 * @returns – A program fragment.
 */
export function codegenProjection(
  ir: CartoKitIR,
  libraryBackend: CartoKitBackend['library']
): string {
  switch (libraryBackend) {
    case 'mapbox': {
      return ir.projection === 'globe' ? 'projection: "globe"' : '';
    }
    case 'maplibre': {
      return ir.projection === 'globe'
        ? `
        map.on('style.load', () => {
          map.setProjection({ type: 'globe' });
        });
      `
        : '';
    }
    default: {
      return '';
    }
  }
}
