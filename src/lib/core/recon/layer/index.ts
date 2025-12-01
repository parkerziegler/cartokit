import type { ReconFnParams, ReconFnResult } from '$lib/core/recon';
import { map } from '$lib/state/map.svelte';

export function reconLayerDiffs({
  diff,
  sourceIR,
  targetIR
}: ReconFnParams): ReconFnResult {
  switch (diff.type) {
    case 'layer-visibility': {
      const layer = targetIR.layers[diff.layerId];

      if (diff.payload.visibility === 'visible') {
        map.value!.setLayoutProperty(layer.id, 'visibility', 'visible');

        // Ensure the stroke layer, if present, is made visible.
        if (map.value!.getLayer(`${layer.id}-stroke`)) {
          map.value!.setLayoutProperty(
            `${layer.id}-stroke`,
            'visibility',
            'visible'
          );
        }
      } else {
        map.value!.setLayoutProperty(layer.id, 'visibility', 'none');

        // Ensure the stroke layer, if present, is hidden.
        if (map.value!.getLayer(`${layer.id}-stroke`)) {
          map.value!.setLayoutProperty(
            `${layer.id}-stroke`,
            'visibility',
            'none'
          );
        }
      }

      break;
    }
    case 'layer-tooltip-visibility': {
      break;
    }
    case 'remove-layer': {
      // Remove all instrumented layers.
      [
        'stroke',
        'outlines',
        'points',
        'hover',
        'select',
        'outlines-hover',
        'outlines-select',
        'points-hover',
        'points-select'
      ].forEach((modifier) => {
        if (map.value!.getLayer(`${diff.layerId}-${modifier}`)) {
          map.value!.removeLayer(`${diff.layerId}-${modifier}`);
        }
      });

      // Remove the source.
      map.value!.removeSource(diff.layerId);

      // Remove the points source for heatmaps.
      if (map.value!.getSource(`${diff.layerId}-points`)) {
        map.value!.removeSource(`${diff.layerId}-points`);
      }

      break;
    }
    case 'rename-layer': {
      break;
    }
  }

  return {
    diff,
    sourceIR,
    targetIR
  };
}
