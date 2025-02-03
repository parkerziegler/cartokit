import type { CartoKitIR } from '$lib/types';

export function codegenProjection(ir: CartoKitIR): string {
  if (ir.projection === 'globe') {
    return 'projection: "globe"';
  }

  return '';
}
