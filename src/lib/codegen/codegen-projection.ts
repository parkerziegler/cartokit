import type { CartoKitBackend, CartoKitIR } from '$lib/types';

/**
 * Generate a program fragment for the map's projection.
 *
 * @param ir The {@link CartoKitIR}.
 * @param libraryBackend The backend library for the current {@link CartoKitIR}.
 * @returns A program fragment containing the definition of the map's projection.
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
  }
}
