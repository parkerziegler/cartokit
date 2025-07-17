import type { Map } from 'maplibre-gl';

import type {
  CartoKitLayer,
  CartoKitProportionalSymbolLayer
} from '$lib/types';
import {
  DEFAULT_MIN_SIZE,
  DEFAULT_MAX_SIZE,
  DEFAULT_FILL,
  DEFAULT_STROKE_WIDTH,
  DEFAULT_STROKE
} from '$lib/utils/constants';
import { selectQuantitativeAttribute } from '$lib/utils/geojson';
import { deriveCentroids } from '$lib/stdlib/centroid';
import deriveCentroidsSrc from '$lib/stdlib/centroid?raw';
import { parseStringToTransformation } from '$lib/utils/parse';
import { deriveSize } from '$lib/interaction/geometry';
import { randomColor } from '$lib/utils/color';
import { DEFAULT_OPACITY } from '$lib/utils/constants';

/**
 * Transition a @see{CartoKitLayer} to a @see{CartoKitProportionalSymbolLayer}.
 *
 * @param {Map} map — The top-level MapLibre GL map instance.
 * @param {CartoKitLayer} layer — The @see{CartoKitLayer} to transition.
 * @returns {Object} — The transitioned
 * @see{CartoKitProportionalSymbolLayer} and a Boolean flag indicating whether
 * the layer needs to be redrawn.
 */
export function transitionToProportionalSymbol(
  map: Map,
  layer: CartoKitLayer
): {
  targetLayer: CartoKitProportionalSymbolLayer;
  redraw: boolean;
} {
  switch (layer.type) {
    case 'Choropleth':
    case 'Polygon': {
      const targetLayer: CartoKitProportionalSymbolLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Proportional Symbol',
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
          size: {
            attribute: selectQuantitativeAttribute(layer.data.geojson.features),
            min: DEFAULT_MIN_SIZE,
            max: DEFAULT_MAX_SIZE
          },
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

      const targetLayer: CartoKitProportionalSymbolLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Proportional Symbol',
        data: {
          url: layer.data.url,
          fileName: layer.data.fileName,
          sourceGeojson: layer.data.sourceGeojson,
          geojson: deriveCentroids(layer.data.sourceGeojson),
          transformations
        },
        style: {
          size: {
            attribute: layer.style.dots.attribute,
            min: DEFAULT_MIN_SIZE,
            max: DEFAULT_MAX_SIZE
          },
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
      const targetLayer: CartoKitProportionalSymbolLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Proportional Symbol',
        data: layer.data,
        style: {
          size: {
            attribute:
              layer.style.heatmap.weight.type === 'Quantitative'
                ? layer.style.heatmap.weight.attribute
                : selectQuantitativeAttribute(layer.data.geojson.features),
            min: DEFAULT_MIN_SIZE,
            max: DEFAULT_MAX_SIZE
          },
          fill: {
            type: 'Constant',
            color: DEFAULT_FILL,
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
      const targetLayer: CartoKitProportionalSymbolLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Proportional Symbol',
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
          size: {
            attribute: selectQuantitativeAttribute(layer.data.geojson.features),
            min: DEFAULT_MIN_SIZE,
            max: DEFAULT_MAX_SIZE
          },
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
    case 'Point': {
      const targetLayer: CartoKitProportionalSymbolLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Proportional Symbol',
        data: layer.data,
        style: {
          size: {
            attribute: selectQuantitativeAttribute(layer.data.geojson.features),
            min: DEFAULT_MIN_SIZE,
            max: DEFAULT_MAX_SIZE
          },
          fill: layer.style.fill,
          stroke: layer.style.stroke
        }
      };

      // Update the circle-radius of the existing layer. All other paint
      // properties should remain unchanged.
      map.setPaintProperty(layer.id, 'circle-radius', deriveSize(targetLayer));

      return {
        targetLayer,
        redraw: false
      };
    }
    case 'Proportional Symbol':
      return {
        targetLayer: layer,
        redraw: false
      };
  }
}
