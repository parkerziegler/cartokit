import type { CartoKitIR } from '$lib/types';

export function codegenCSS(ir: CartoKitIR) {
  return `body {
  margin: 0;
}

#map {
  position: absolute;
  inset: 0;
  background: ${ir.basemap.mode === 'dark' ? '#000000' : '#ffffff'};
}
`;
}
