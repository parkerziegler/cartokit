import type { CartoKitHeatmapLayer, CartoKitLayer } from '$lib/types';
import {
  DEFAULT_HEATMAP_INTENSITY,
  DEFAULT_HEATMAP_RADIUS,
  DEFAULT_OPACITY,
  DEFAULT_RAMP,
  DEFAULT_SCHEME_DIRECTION
} from '$lib/utils/constants';

/**
 * Transition a @see{CartoKitLayer} to a @see{CartoKitHeatmapLayer}.
 *
 * @param {CartoKitLayer} layer — The @see{CartoKitLayer} to transition.
 * @returns {Object} — The transitioned @see{CartoKitHeatmapLayer} and a
 * Boolean flag indicating whether the layer needs to be redrawn.
 */
export function transitionToHeatmap(layer: CartoKitLayer): {
  targetLayer: CartoKitHeatmapLayer;
  redraw: boolean;
} {
  switch (layer.type) {
    case 'Choropleth':
    case 'Dot Density':
    case 'Line':
    case 'Polygon':
      throw new Error(
        `Unsupported geometry transition. Transition initiated from ${layer.type} to Heatmap.`
      );
    case 'Point': {
      const targetLayer: CartoKitHeatmapLayer = {
        id: layer.id,
        type: 'Heatmap',
        displayName: layer.displayName,
        data: layer.data,
        style: {
          heatmap: {
            weight: {
              type: 'Constant',
              value: 1
            },
            ramp: {
              id: DEFAULT_RAMP,
              direction: DEFAULT_SCHEME_DIRECTION
            },
            radius: DEFAULT_HEATMAP_RADIUS,
            intensity: DEFAULT_HEATMAP_INTENSITY,
            opacity: layer.style.fill?.opacity ?? DEFAULT_OPACITY
          }
        },
        layout: layer.layout
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Proportional Symbol': {
      const targetLayer: CartoKitHeatmapLayer = {
        id: layer.id,
        type: 'Heatmap',
        displayName: layer.displayName,
        data: layer.data,
        style: {
          heatmap: {
            weight: {
              type: 'Quantitative',
              attribute: layer.style.size.attribute,
              min: 0,
              max: 1
            },
            ramp: {
              id: DEFAULT_RAMP,
              direction: DEFAULT_SCHEME_DIRECTION
            },
            radius: DEFAULT_HEATMAP_RADIUS,
            intensity: DEFAULT_HEATMAP_INTENSITY,
            opacity: layer.style.fill?.opacity ?? DEFAULT_OPACITY
          }
        },
        layout: layer.layout
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Heatmap': {
      return {
        targetLayer: layer,
        redraw: false
      };
    }
  }
}
