import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';
import type { CartoKitDotDensityLayer } from '$lib/types';

export async function patchDotDensityDiffs(
  params: Promise<PatchFnParams>
): Promise<PatchFnResult> {
  const { diff, ir } = await params;

  switch (diff.type) {
    case 'dot-value': {
      const layer = ir.layers[diff.layerId] as CartoKitDotDensityLayer;

      layer.style.dots.value = diff.payload.value;

      break;
    }
  }

  return {
    diff,
    ir
  };
}
