import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';
import type {
  CartoKitDotDensityLayer,
  CartoKitPointLayer,
  CartoKitProportionalSymbolLayer
} from '$lib/types';
import type {} from '$lib/types';

export async function patchSizeDiffs(
  params: Promise<PatchFnParams>
): Promise<PatchFnResult> {
  const { diff, ir } = await params;

  switch (diff.type) {
    case 'size': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitPointLayer
        | CartoKitDotDensityLayer;

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
