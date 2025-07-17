import type { ExpressionSpecification } from 'maplibre-gl';
import * as d3 from 'd3';

import type { CartoKitHeatmapLayer } from '$lib/types';

export function deriveHeatmapWeight(
  layer: CartoKitHeatmapLayer
): ExpressionSpecification {
  switch (layer.style.heatmap.weight.type) {
    case 'Constant':
      return ['literal', layer.style.heatmap.weight.value];
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
