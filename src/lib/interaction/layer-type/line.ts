import type { CartoKitLayer, CartoKitLineLayer } from '$lib/types';
import {
  DEFAULT_STROKE,
  DEFAULT_STROKE_WIDTH,
  DEFAULT_OPACITY
} from '$lib/utils/constants';

/**
 * Transition a @see{CartoKitLayer} to a @see{CartoKitLineLayer}.
 *
 * @param {CartoKitLayer} layer — The @see{CartoKitLayer} to transition.
 * @returns {TransitionMapTypeReturnValue} — The transitioned
 * @see{CartoKitLineLayer} and a Boolean flag indicating whether the layer needs
 * to be redrawn.
 */
export function transitionToLine(layer: CartoKitLayer): {
  targetLayer: CartoKitLineLayer;
  redraw: boolean;
} {
  switch (layer.type) {
    case 'Choropleth':
    case 'Dot Density':
    case 'Heatmap':
    case 'Polygon':
      throw new Error(
        `Unsupported geometry transition. Transition initiated from ${layer.type} to Line.`
      );
    case 'Line':
      return {
        targetLayer: layer,
        redraw: false
      };
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

      return {
        targetLayer,
        redraw: true
      };
    }
  }
}
