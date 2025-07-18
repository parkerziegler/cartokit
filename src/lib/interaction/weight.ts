import type { ExpressionSpecification } from 'maplibre-gl';
import * as d3 from 'd3';

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
        data: {
          geojson: { features }
        },
        style: {
          heatmap: {
            weight: { attribute, min: weightMin, max: weightMax }
          }
        }
      } = layer;
      const extent = d3.extent(features, (d) => d.properties?.[attribute] ?? 0);
      const [min, max] = [extent[0] ?? 0, extent[1] ?? 1];

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
