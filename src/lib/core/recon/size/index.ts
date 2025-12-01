import type { ReconFnParams, ReconFnResult } from '$lib/core/recon';
import { deriveRadius } from '$lib/interaction/geometry';
import { map } from '$lib/state/map.svelte';
import type { CartoKitProportionalSymbolLayer } from '$lib/types';

export function reconSizeDiffs({
  diff,
  sourceIR,
  targetIR
}: ReconFnParams): ReconFnResult {
  switch (diff.type) {
    case 'size': {
      map.value!.setPaintProperty(
        diff.layerId,
        'circle-size',
        diff.payload.size
      );
      break;
    }
    case 'min-size':
    case 'max-size': {
      const layer = targetIR.layers[
        diff.layerId
      ] as CartoKitProportionalSymbolLayer;

      map.value!.setPaintProperty(
        diff.layerId,
        'circle-radius',
        deriveRadius(layer)
      );
      break;
    }
  }

  return {
    diff,
    sourceIR,
    targetIR
  };
}
