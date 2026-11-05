import type {
  CartoKitHeatmapLayer,
  CartoKitPointLayer,
  CartoKitProportionalSymbolLayer
} from '$lib/types';
import { selectQuantitativeAttribute } from '$lib/utils/attribute';
import {
  DEFAULT_FILL,
  DEFAULT_MAX_SIZE,
  DEFAULT_MIN_SIZE,
  DEFAULT_OPACITY,
  DEFAULT_STROKE,
  DEFAULT_STROKE_WIDTH
} from '$lib/utils/constants';

/**
 * Patch a {@link CartoKitHeatmapLayer} or a {@link CartoKitPointLayer} to a
 * {@link CartoKitProportionalSymbolLayer}.
 *
 * @param layer The {@link CartoKitHeatmapLayer} or {@link CartoKitPointLayer}
 * to patch.
 * @returns The patched {@link CartoKitProportionalSymbolLayer}.
 */
export function patchProportionalSymbol(
  layer: CartoKitHeatmapLayer | CartoKitPointLayer
): CartoKitProportionalSymbolLayer {
  switch (layer.type) {
    case 'Heatmap': {
      const attribute =
        layer.style.heatmap.weight.type === 'Quantitative'
          ? layer.style.heatmap.weight.attribute
          : selectQuantitativeAttribute(layer.id);

      const targetLayer: CartoKitProportionalSymbolLayer = {
        ...layer,
        type: 'Proportional Symbol',
        style: {
          size: {
            attribute,
            min: DEFAULT_MIN_SIZE,
            max: DEFAULT_MAX_SIZE
          },
          fill: {
            type: 'Constant',
            color: DEFAULT_FILL,
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
    case 'Point': {
      const targetLayer: CartoKitProportionalSymbolLayer = {
        ...layer,
        type: 'Proportional Symbol',
        style: {
          ...layer.style,
          size: {
            attribute: selectQuantitativeAttribute(layer.id),
            min: DEFAULT_MIN_SIZE,
            max: DEFAULT_MAX_SIZE
          }
        }
      };

      return targetLayer;
    }
  }
}
