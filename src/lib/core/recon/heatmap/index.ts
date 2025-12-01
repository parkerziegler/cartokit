import type { ReconFnParams, ReconFnResult } from '$lib/core/recon';
import { deriveColorRamp } from '$lib/interaction/color';
import { deriveHeatmapWeight } from '$lib/interaction/weight';
import { map } from '$lib/state/map.svelte';
import type { CartoKitHeatmapLayer } from '$lib/types';

export function reconHeatmapDiffs({
  diff,
  sourceIR,
  targetIR
}: ReconFnParams): ReconFnResult {
  switch (diff.type) {
    case 'heatmap-opacity': {
      map.value!.setPaintProperty(
        diff.layerId,
        'heatmap-opacity',
        diff.payload.opacity
      );
      break;
    }
    case 'heatmap-radius': {
      map.value!.setPaintProperty(
        diff.layerId,
        'heatmap-radius',
        diff.payload.radius
      );
      break;
    }
    case 'heatmap-ramp':
    case 'heatmap-ramp-direction': {
      const layer = targetIR.layers[diff.layerId] as CartoKitHeatmapLayer;

      map.value!.setPaintProperty(
        diff.layerId,
        'heatmap-color',
        deriveColorRamp(layer.style.heatmap)
      );
      break;
    }
    case 'heatmap-weight-type':
    case 'heatmap-weight-attribute':
    case 'heatmap-weight-min':
    case 'heatmap-weight-max':
    case 'heatmap-weight-value': {
      const layer = targetIR.layers[diff.layerId] as CartoKitHeatmapLayer;

      map.value!.setPaintProperty(
        diff.layerId,
        'heatmap-weight',
        deriveHeatmapWeight(layer)
      );
      break;
    }
  }

  return {
    diff,
    sourceIR,
    targetIR
  };
}
