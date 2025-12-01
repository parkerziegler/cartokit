import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';
import type { CartoKitHeatmapLayer } from '$lib/types';

export function patchHeatmapDiffs({ diff, ir }: PatchFnParams): PatchFnResult {
  switch (diff.type) {
    case 'heatmap-opacity': {
      const layer = ir.layers[diff.layerId] as CartoKitHeatmapLayer;

      layer.style.heatmap.opacity = diff.payload.opacity;

      break;
    }
    case 'heatmap-radius': {
      const layer = ir.layers[diff.layerId] as CartoKitHeatmapLayer;

      layer.style.heatmap.radius = diff.payload.radius;

      break;
    }
    case 'heatmap-ramp': {
      const layer = ir.layers[diff.layerId] as CartoKitHeatmapLayer;

      layer.style.heatmap.ramp.id = diff.payload.ramp;

      break;
    }
    case 'heatmap-ramp-direction': {
      const layer = ir.layers[diff.layerId] as CartoKitHeatmapLayer;

      layer.style.heatmap.ramp.direction = diff.payload.direction;

      break;
    }
    case 'heatmap-weight-type': {
      const layer = ir.layers[diff.layerId] as CartoKitHeatmapLayer;

      layer.style.heatmap.weight.type = diff.payload.weightType;

      break;
    }
    case 'heatmap-weight-attribute': {
      const layer = ir.layers[diff.layerId] as CartoKitHeatmapLayer;

      if (layer.style.heatmap.weight.type === 'Quantitative') {
        layer.style.heatmap.weight.attribute = diff.payload.weightAttribute;
      }

      break;
    }
    case 'heatmap-weight-min': {
      const layer = ir.layers[diff.layerId] as CartoKitHeatmapLayer;

      if (layer.style.heatmap.weight.type === 'Quantitative') {
        layer.style.heatmap.weight.min = diff.payload.min;
      }

      break;
    }
    case 'heatmap-weight-max': {
      const layer = ir.layers[diff.layerId] as CartoKitHeatmapLayer;

      if (layer.style.heatmap.weight.type === 'Quantitative') {
        layer.style.heatmap.weight.max = diff.payload.max;
      }

      break;
    }
    case 'heatmap-weight-value': {
      const layer = ir.layers[diff.layerId] as CartoKitHeatmapLayer;

      if (layer.style.heatmap.weight.type === 'Constant') {
        layer.style.heatmap.weight.value = diff.payload.value;
      }

      break;
    }
  }

  return {
    diff,
    ir
  };
}
