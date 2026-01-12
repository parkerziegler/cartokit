import type { CartoKitDiff } from '$lib/core/diff';
import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';
import type {
  CartoKitChoroplethLayer,
  CartoKitDotDensityLayer,
  CartoKitLineLayer,
  CartoKitPointLayer,
  CartoKitPolygonLayer,
  CartoKitProportionalSymbolLayer
} from '$lib/types';

/**
 * Patch stroke-related {@link CartoKitDiff}s for the current {@link CartoKitIR}.
 *
 * @param params A promise that resolves to the {@link PatchFnParams}, including
 * the current {@link CartoKitDiff} and {@link CartoKitIR}.
 * @returns A promise that resolves to the {@link PatchFnResult}, including
 * the current {@link CartoKitDiff} and patched {@link CartoKitIR}.
 */
export async function patchStrokeDiffs(
  params: Promise<PatchFnParams>
): Promise<PatchFnResult> {
  const { diff, ir, inverseDiff } = await params;

  let inverse: CartoKitDiff = inverseDiff;

  switch (diff.type) {
    case 'stroke-color': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitDotDensityLayer
        | CartoKitLineLayer
        | CartoKitPointLayer
        | CartoKitPolygonLayer
        | CartoKitProportionalSymbolLayer;

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'stroke-color',
        layerId: diff.layerId,
        payload: {
          color: layer.style.stroke.color
        }
      };

      // Apply the patch.
      layer.style.stroke.color = diff.payload.color;

      break;
    }
    case 'stroke-width': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitDotDensityLayer
        | CartoKitLineLayer
        | CartoKitPointLayer
        | CartoKitPolygonLayer
        | CartoKitProportionalSymbolLayer;

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'stroke-width',
        layerId: diff.layerId,
        payload: {
          strokeWidth: layer.style.stroke.width
        }
      };

      // Apply the patch.
      layer.style.stroke.width = diff.payload.strokeWidth;

      break;
    }
    case 'stroke-opacity': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitDotDensityLayer
        | CartoKitLineLayer
        | CartoKitPointLayer
        | CartoKitPolygonLayer
        | CartoKitProportionalSymbolLayer;

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'stroke-opacity',
        layerId: diff.layerId,
        payload: {
          opacity: layer.style.stroke.opacity
        }
      };

      // Apply the patch.
      layer.style.stroke.opacity = diff.payload.opacity;

      break;
    }
    case 'add-stroke': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitDotDensityLayer
        | CartoKitPointLayer
        | CartoKitPolygonLayer
        | CartoKitProportionalSymbolLayer;

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'remove-stroke',
        layerId: diff.layerId,
        payload: {}
      };

      // Apply the patch.
      layer.style.stroke.visible = true;

      break;
    }
    case 'remove-stroke': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitDotDensityLayer
        | CartoKitPointLayer
        | CartoKitPolygonLayer
        | CartoKitProportionalSymbolLayer;

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'add-stroke',
        layerId: diff.layerId,
        payload: {}
      };

      // Apply the patch.
      layer.style.stroke.visible = false;

      break;
    }
  }

  return {
    diff,
    ir,
    inverseDiff: inverse
  };
}
