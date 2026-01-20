import type { CartoKitDiff } from '$lib/core/diff';
import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';
import type {
  CartoKitDotDensityLayer,
  CartoKitPointLayer,
  CartoKitProportionalSymbolLayer
} from '$lib/types';

/**
 * Patch size-related {@link CartoKitDiff}s for the current {@link CartoKitIR}.
 *
 * @param params A promise that resolves to the {@link PatchFnParams}, including
 * the current {@link CartoKitDiff} and {@link CartoKitIR}.
 * @returns A promise that resolves to the {@link PatchFnResult}, including
 * the current {@link CartoKitDiff} and patched {@link CartoKitIR}.
 */
export async function patchSizeDiffs(
  params: Promise<PatchFnParams>
): Promise<PatchFnResult> {
  const { diff, ir, inverseDiff } = await params;

  let inverse: CartoKitDiff = inverseDiff;

  switch (diff.type) {
    case 'size': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitPointLayer
        | CartoKitDotDensityLayer;

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'size',
        layerId: diff.layerId,
        payload: {
          size: layer.style.size
        }
      };

      // Apply the patch.
      layer.style.size = diff.payload.size;

      break;
    }
    case 'size-attribute': {
      const layer = ir.layers[diff.layerId] as CartoKitProportionalSymbolLayer;

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'size-attribute',
        layerId: diff.layerId,
        payload: {
          attribute: layer.style.size.attribute
        }
      };

      // Apply the patch.
      layer.style.size.attribute = diff.payload.attribute;

      break;
    }
    case 'min-size': {
      const layer = ir.layers[diff.layerId] as CartoKitProportionalSymbolLayer;

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'min-size',
        layerId: diff.layerId,
        payload: {
          minSize: layer.style.size.min
        }
      };

      // Apply the patch.
      layer.style.size.min = diff.payload.minSize;

      break;
    }
    case 'max-size': {
      const layer = ir.layers[diff.layerId] as CartoKitProportionalSymbolLayer;

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'max-size',
        layerId: diff.layerId,
        payload: {
          maxSize: layer.style.size.max
        }
      };

      // Apply the patch.
      layer.style.size.max = diff.payload.maxSize;

      break;
    }
  }

  return {
    diff,
    ir,
    inverseDiff: inverse
  };
}
