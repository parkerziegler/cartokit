import type { CartoKitHeatmapLayer, CartoKitLayer } from '$lib/types';
import {
  DEFAULT_HEATMAP_INTENSITY,
  DEFAULT_HEATMAP_RADIUS,
  DEFAULT_RAMP,
  DEFAULT_SCHEME_DIRECTION
} from '$lib/utils/constants';

/**
 * Patch (transform) a {@link CartoKitLayer} to a {@link CartoKitHeatmapLayer}.
 *
 * @param {CartoKitLayer} layer The {@link CartoKitLayer} to patch (transform).
 * @returns {CartoKitHeatmapLayer} The transformed {@link CartoKitHeatmapLayer}.
 */
export function patchHeatmap(layer: CartoKitLayer): CartoKitHeatmapLayer {
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
            opacity: layer.style.fill.opacity,
            visible: layer.style.fill.visible
          }
        },
        layout: layer.layout
      };

      return targetLayer;
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
            opacity: layer.style.fill.opacity,
            visible: layer.style.fill.visible
          }
        },
        layout: layer.layout
      };

      return targetLayer;
    }
    case 'Heatmap': {
      return layer;
    }
  }
}
