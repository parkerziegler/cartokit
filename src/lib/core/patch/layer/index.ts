import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';

export function patchLayerDiffs({ diff, ir }: PatchFnParams): PatchFnResult {
  switch (diff.type) {
    case 'layer-visibility': {
      const layer = ir.layers[diff.layerId];

      layer.layout.visibility = diff.payload.visibility;

      break;
    }
    case 'layer-tooltip-visibility': {
      const layer = ir.layers[diff.layerId];

      layer.layout.tooltip.visible = diff.payload.visible;

      break;
    }
    case 'remove-layer': {
      delete ir.layers[diff.layerId];
      break;
    }
    case 'rename-layer': {
      const layer = ir.layers[diff.layerId];

      layer.displayName = diff.payload.displayName;

      break;
    }
  }

  return {
    diff,
    ir
  };
}
