import type {
  CartoKitHeatmapLayer,
  CartoKitPointLayer,
  CartoKitProportionalSymbolLayer
} from '$lib/types';
import {
  DEFAULT_HEATMAP_INTENSITY,
  DEFAULT_HEATMAP_RADIUS,
  DEFAULT_RAMP,
  DEFAULT_SCHEME_DIRECTION
} from '$lib/utils/constants';

/**
 * Patch a {@link CartoKitPointLayer} or a
 * {@link CartoKitProportionalSymbolLayer} to a {@link CartoKitHeatmapLayer}.
 *
 * @param layer The {@link CartoKitPointLayer} or
 * {@link CartoKitProportionalSymbolLayer}  to patch.
 * @returns The patched {@link CartoKitHeatmapLayer}.
 */
export function patchHeatmap(
  layer: CartoKitPointLayer | CartoKitProportionalSymbolLayer
): CartoKitHeatmapLayer {
  switch (layer.type) {
    case 'Point': {
      const targetLayer: CartoKitHeatmapLayer = {
        ...layer,
        type: 'Heatmap',
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
            opacity: layer.style.fill.opacity
          }
        }
      };

      return targetLayer;
    }
    case 'Proportional Symbol': {
      const targetLayer: CartoKitHeatmapLayer = {
        ...layer,
        type: 'Heatmap',
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
            opacity: layer.style.fill.opacity
          }
        }
      };

      return targetLayer;
    }
  }
}
