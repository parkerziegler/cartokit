import type { CartoKitLayer, CartoKitLineLayer } from '$lib/types';
import {
  DEFAULT_STROKE,
  DEFAULT_STROKE_WIDTH,
  DEFAULT_OPACITY
} from '$lib/utils/constants';

/**
 * Patch (transform) a {@link CartoKitLayer} to a {@link CartoKitLineLayer}.
 *
 * @param {CartoKitLayer} layer — The {@link CartoKitLayer} to patch (transform).
 * @returns {CartoKitLineLayer} The transformed {@link CartoKitLineLayer}.
 */
export function patchLine(layer: CartoKitLayer): CartoKitLineLayer {
  switch (layer.type) {
    case 'Choropleth':
    case 'Heatmap':
    case 'Polygon':
      throw new Error(
        `Unsupported geometry transition. Transition initiated from ${layer.type} to Line.`
      );
    case 'Line':
      return layer;
    case 'Point':
    case 'Proportional Symbol': {
      const targetLayer: CartoKitLineLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Line',
        data: {
          url: layer.data.url,
          fileName: layer.data.fileName,
          geojson: layer.data.sourceGeojson,
          sourceGeojson: layer.data.sourceGeojson,
          transformations: layer.data.transformations
        },
        style: {
          stroke: layer.style.stroke ?? {
            type: 'Constant',
            color: DEFAULT_STROKE,
            width: DEFAULT_STROKE_WIDTH,
            opacity: DEFAULT_OPACITY
          }
        },
        layout: layer.layout
      };

      return targetLayer;
    }
  }
}
