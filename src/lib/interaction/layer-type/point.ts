import type { Map } from 'maplibre-gl';

import type { CartoKitLayer, CartoKitPointLayer } from '$lib/types';
import { deriveCentroids } from '$lib/stdlib/centroid';
import deriveCentroidsSrc from '$lib/stdlib/centroid?raw';
import { randomColor } from '$lib/utils/color';
import { parseStringToTransformation } from '$lib/utils/parse';
import {
  DEFAULT_OPACITY,
  DEFAULT_RADIUS,
  DEFAULT_STROKE,
  DEFAULT_STROKE_WIDTH
} from '$lib/utils/constants';

/**
 * Transition a @see{CartoKitLayer} to a @see{CartoKitPointLayer}.
 *
 * @param {Map} map — The top-level MapLibre GL map instance.
 * @param {CartoKitLayer} layer — The @see{CartoKitLayer} to transition.
 * @returns {Object} — The transitioned @see{CartoKitPointLayer} and a
 * Boolean flag indicating whether the layer needs to be redrawn.
 */
export function transitionToPoint(
  map: Map,
  layer: CartoKitLayer
): {
  targetLayer: CartoKitPointLayer;
  redraw: boolean;
} {
  switch (layer.type) {
    case 'Choropleth':
    case 'Polygon': {
      const targetLayer: CartoKitPointLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Point',
        data: {
          url: layer.data.url,
          fileName: layer.data.fileName,
          sourceGeojson: layer.data.sourceGeojson,
          geojson: deriveCentroids(layer.data.geojson),
          transformations: [
            ...layer.data.transformations,
            {
              ...parseStringToTransformation(deriveCentroidsSrc, 'geometric'),
              args: []
            }
          ]
        },
        style: {
          size: DEFAULT_RADIUS,
          fill: layer.style.fill,
          stroke: layer.style.stroke
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Dot Density': {
      // Replace the dot density transformation with a centroid transformation.
      const deriveCentroidsTransformation = {
        ...parseStringToTransformation(deriveCentroidsSrc, 'geometric'),
        args: []
      };

      const generateDotDensityPointsTransformationIndex =
        layer.data.transformations.findIndex(
          (transformation) => transformation.name === 'generateDotDensityPoints'
        );
      const transformations = [...layer.data.transformations].splice(
        generateDotDensityPointsTransformationIndex,
        1,
        deriveCentroidsTransformation
      );

      const targetLayer: CartoKitPointLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Point',
        data: {
          url: layer.data.url,
          fileName: layer.data.fileName,
          sourceGeojson: layer.data.sourceGeojson,
          geojson: deriveCentroids(layer.data.sourceGeojson),
          transformations
        },
        style: {
          size: layer.style.dots.size,
          fill: layer.style.fill,
          stroke: layer.style.stroke
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Heatmap': {
      const targetLayer: CartoKitPointLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Point',
        data: layer.data,
        style: {
          size: DEFAULT_RADIUS,
          fill: {
            type: 'Constant',
            color: randomColor(),
            opacity: layer.style.heatmap.opacity
          },
          stroke: {
            type: 'Constant',
            color: DEFAULT_STROKE,
            opacity: DEFAULT_OPACITY,
            width: DEFAULT_STROKE_WIDTH
          }
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Line': {
      const targetLayer: CartoKitPointLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Point',
        data: {
          url: layer.data.url,
          fileName: layer.data.fileName,
          sourceGeojson: layer.data.sourceGeojson,
          geojson: deriveCentroids(layer.data.geojson),
          transformations: [
            ...layer.data.transformations,
            {
              ...parseStringToTransformation(deriveCentroidsSrc, 'geometric'),
              args: []
            }
          ]
        },
        style: {
          size: DEFAULT_RADIUS,
          fill: {
            type: 'Constant',
            color: randomColor(),
            opacity: DEFAULT_OPACITY
          },
          stroke: layer.style.stroke
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Point':
      return {
        targetLayer: layer,
        redraw: false
      };
    case 'Proportional Symbol': {
      const targetLayer: CartoKitPointLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Point',
        data: layer.data,
        style: {
          fill: {
            type: 'Constant',
            color: randomColor(),
            opacity: layer.style.fill?.opacity ?? DEFAULT_OPACITY
          },
          stroke: layer.style.stroke,
          size: DEFAULT_RADIUS
        }
      };

      // Update the circle-radius of the existing layer. All other paint
      // properties should remain unchanged.
      map.setPaintProperty(layer.id, 'circle-radius', DEFAULT_RADIUS);

      return {
        targetLayer,
        redraw: false
      };
    }
  }
}
