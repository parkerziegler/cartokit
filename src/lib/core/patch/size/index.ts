import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';
import type {
  CartoKitPointLayer,
  CartoKitProportionalSymbolLayer
} from '$lib/types';

export function patchSizeDiffs({ diff, ir }: PatchFnParams): PatchFnResult {
  switch (diff.type) {
    case 'size': {
      const layer = ir.layers[diff.layerId] as CartoKitPointLayer;

      layer.style.size = diff.payload.size;

      break;
    }
    case 'min-size': {
      const layer = ir.layers[diff.layerId] as CartoKitProportionalSymbolLayer;

      layer.style.size.min = diff.payload.minSize;

      break;
    }
    case 'max-size': {
      const layer = ir.layers[diff.layerId] as CartoKitProportionalSymbolLayer;

      layer.style.size.max = diff.payload.maxSize;

      break;
    }
  }

  return {
    diff,
    ir
  };
}
