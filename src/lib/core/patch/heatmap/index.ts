import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';
import type { CartoKitHeatmapLayer } from '$lib/types';
import { selectQuantitativeAttribute } from '$lib/utils/geojson';

/**
 * Patch heatmap-related {@link CartoKitDiff}s for the current {@link CartoKitIR}.
 *
 * @param params A promise that resolves to the {@link PatchFnParams}, including
 * the current {@link CartoKitDiff} and {@link CartoKitIR}.
 * @returns A promise that resolves to the {@link PatchFnResult}, including
 * the current {@link CartoKitDiff} and patched {@link CartoKitIR}.
 */
export async function patchHeatmapDiffs(
  params: Promise<PatchFnParams>
): Promise<PatchFnResult> {
  const { diff, ir } = await params;

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

      if (diff.payload.weightType === 'Constant') {
        layer.style.heatmap.weight = {
          type: 'Constant',
          value: 1
        };
      } else if (diff.payload.weightType === 'Quantitative') {
        layer.style.heatmap.weight = {
          type: 'Quantitative',
          attribute: selectQuantitativeAttribute(layer.data.geojson.features),
          min: 0,
          max: 1
        };
      }

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
