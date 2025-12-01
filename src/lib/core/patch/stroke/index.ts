import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';
import type {
  CartoKitChoroplethLayer,
  CartoKitLineLayer,
  CartoKitPointLayer,
  CartoKitPolygonLayer,
  CartoKitProportionalSymbolLayer
} from '$lib/types';

export function patchStrokeDiffs({ diff, ir }: PatchFnParams): PatchFnResult {
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
