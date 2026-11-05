import type {
  CartoKitHeatmapLayer,
  CartoKitPointLayer,
  CartoKitProportionalSymbolLayer
} from '$lib/types';
import { randomColor } from '$lib/utils/color';
import {
  DEFAULT_OPACITY,
  DEFAULT_SIZE,
  DEFAULT_STROKE,
  DEFAULT_STROKE_WIDTH
} from '$lib/utils/constants';

/**
 * Patch a {@link CartoKitHeatmapLayer} or a
 * {@link CartoKitProportionalSymbolLayer} to a {@link CartoKitPointLayer}.
 *
 * @param layer The {@link CartoKitHeatmapLayer} or
 * {@link CartoKitProportionalSymbolLayer} to patch.
 * @returns The patched {@link CartoKitPointLayer}.
 */
export function patchPoint(
  layer: CartoKitHeatmapLayer | CartoKitProportionalSymbolLayer
): CartoKitPointLayer {
  switch (layer.type) {
    case 'Heatmap': {
      const targetLayer: CartoKitPointLayer = {
        ...layer,
        type: 'Point',
        style: {
          size: DEFAULT_SIZE,
          fill: {
            type: 'Constant',
            color: randomColor(),
            opacity: layer.style.heatmap.opacity,
            visible: true
          },
          stroke: {
            type: 'Constant',
            color: DEFAULT_STROKE,
            opacity: DEFAULT_OPACITY,
            width: DEFAULT_STROKE_WIDTH,
            visible: true
          }
        }
      };

      return targetLayer;
    }
    case 'Proportional Symbol': {
      const targetLayer: CartoKitPointLayer = {
        ...layer,
        type: 'Point',
        style: {
          ...layer.style,
          size: DEFAULT_SIZE
        }
      };

      return targetLayer;
    }
  }
}
