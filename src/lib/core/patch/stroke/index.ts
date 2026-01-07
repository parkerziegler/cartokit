import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';
import type {
  CartoKitChoroplethLayer,
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
  const { diff, ir } = await params;

  switch (diff.type) {
    case 'stroke-color': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitLineLayer
        | CartoKitPointLayer
        | CartoKitPolygonLayer
        | CartoKitProportionalSymbolLayer;

      layer.style.stroke.color = diff.payload.color;

      break;
    }
    case 'stroke-width': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitLineLayer
        | CartoKitPointLayer
        | CartoKitPolygonLayer
        | CartoKitProportionalSymbolLayer;

      layer.style.stroke.width = diff.payload.strokeWidth;

      break;
    }
    case 'stroke-opacity': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitLineLayer
        | CartoKitPointLayer
        | CartoKitPolygonLayer
        | CartoKitProportionalSymbolLayer;

      layer.style.stroke.opacity = diff.payload.opacity;

      break;
    }
    case 'add-stroke': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitPolygonLayer
        | CartoKitProportionalSymbolLayer;

      layer.style.stroke.visible = true;

      break;
    }
    case 'remove-stroke': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitPolygonLayer
        | CartoKitProportionalSymbolLayer;

      layer.style.stroke.visible = false;

      break;
    }
  }

  return {
    diff,
    ir
  };
}
