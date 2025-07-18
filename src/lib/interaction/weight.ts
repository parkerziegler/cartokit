import type { ExpressionSpecification } from 'maplibre-gl';

import { catalog } from '$lib/state/catalog.svelte';
import type { CartoKitHeatmapLayer } from '$lib/types';

/**
 * Derive an ExpressionSpecification or number for the weight of a
 * @see{CartoKitHeatmapLayer}.
 *
 * @param {CartoKitHeatmapLayer} layer – The layer to derive the weight for.
 * @returns – An ExpressionSpecification or number for the layer.
 */
export function deriveHeatmapWeight(
  layer: CartoKitHeatmapLayer
): ExpressionSpecification | number {
  switch (layer.style.heatmap.weight.type) {
    case 'Constant':
      return layer.style.heatmap.weight.value;
    case 'Quantitative': {
      const {
        style: {
          heatmap: {
            weight: { attribute, min: weightMin, max: weightMax }
          }
        }
      } = layer;

      const { min, max } = catalog.value[layer.id][attribute];

      return [
        'interpolate',
        ['linear'],
        ['get', attribute],
        min,
        weightMin,
        max,
        weightMax
      ];
    }
  }
}
