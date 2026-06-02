import type {
  CartoKitLayer,
  CartoKitProportionalSymbolLayer
} from '$lib/types';
import { deriveCentroids } from '$lib/stdlib/centroid';
import deriveCentroidsSrc from '$lib/stdlib/centroid?raw';
import { selectQuantitativeAttribute } from '$lib/utils/attributes';
import { randomColor } from '$lib/utils/color';
import {
  DEFAULT_FILL,
  DEFAULT_MAX_SIZE,
  DEFAULT_MIN_SIZE,
  DEFAULT_OPACITY,
  DEFAULT_STROKE,
  DEFAULT_STROKE_WIDTH
} from '$lib/utils/constants';
import { parseStringToTransformation } from '$lib/utils/parse';

/**
 * Patch a {@link CartoKitLayer} to a {@link CartoKitProportionalSymbolLayer}.
 *
 * @param layer The {@link CartoKitLayer} to patch.
 * @returns The patched {@link CartoKitProportionalSymbolLayer}.
 */
export function patchProportionalSymbol(
  layer: CartoKitLayer
): CartoKitProportionalSymbolLayer {
  switch (layer.type) {
    case 'Choropleth':
    case 'Polygon': {
      const source =
        layer.source.type === 'geojson'
          ? {
              ...layer.source,
              data: deriveCentroids(layer.source.data),
              transformations: [
                ...layer.source.transformations,
                {
                  ...parseStringToTransformation(
                    deriveCentroidsSrc,
                    'geometric',
                    'deriveCentroids'
                  ),
                  args: []
                }
              ]
            }
          : layer.source;

      const targetLayer: CartoKitProportionalSymbolLayer = {
        ...layer,
        type: 'Proportional Symbol',
        source,
        style: {
          ...layer.style,
          size: {
            attribute: selectQuantitativeAttribute(layer.source),
            min: DEFAULT_MIN_SIZE,
            max: DEFAULT_MAX_SIZE
          }
        }
      };

      return targetLayer;
    }
    case 'Dot Density': {
      let source = layer.source;

      if (layer.source.type === 'geojson') {
        // Replace the dot density transformation with a centroid transformation.
        const deriveCentroidsTransformation = {
          ...parseStringToTransformation(
            deriveCentroidsSrc,
            'geometric',
            'deriveCentroids'
          ),
          args: []
        };

        const transformations = [...layer.source.transformations].splice(
          layer.source.transformations.findIndex(
            (transformation) =>
              transformation.name === 'generateDotDensityPoints'
          ),
          1,
          deriveCentroidsTransformation
        );

        source = {
          ...layer.source,
          data: deriveCentroids(layer.source.data),
          transformations
        };
      }

      const targetLayer: CartoKitProportionalSymbolLayer = {
        ...layer,
        type: 'Proportional Symbol',
        source,
        style: {
          fill: layer.style.fill,
          stroke: layer.style.stroke,
          size: {
            attribute: layer.style.dot.attribute,
            min: DEFAULT_MIN_SIZE,
            max: DEFAULT_MAX_SIZE
          }
        }
      };

      return targetLayer;
    }
    case 'Heatmap': {
      const attribute =
        layer.style.heatmap.weight.type === 'Quantitative'
          ? layer.style.heatmap.weight.attribute
          : selectQuantitativeAttribute(layer.source);

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
    case 'Line': {
      const source =
        layer.source.type === 'geojson'
          ? {
              ...layer.source,
              data: deriveCentroids(layer.source.data),
              transformations: [
                ...layer.source.transformations,
                {
                  ...parseStringToTransformation(
                    deriveCentroidsSrc,
                    'geometric',
                    'deriveCentroids'
                  ),
                  args: []
                }
              ]
            }
          : layer.source;

      const targetLayer: CartoKitProportionalSymbolLayer = {
        ...layer,
        type: 'Proportional Symbol',
        source,
        style: {
          ...layer.style,
          size: {
            attribute: selectQuantitativeAttribute(layer.source),
            min: DEFAULT_MIN_SIZE,
            max: DEFAULT_MAX_SIZE
          },
          fill: {
            type: 'Constant',
            color: randomColor(),
            opacity: DEFAULT_OPACITY,
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
            attribute: selectQuantitativeAttribute(layer.source),
            min: DEFAULT_MIN_SIZE,
            max: DEFAULT_MAX_SIZE
          }
        }
      };

      return targetLayer;
    }
    case 'Proportional Symbol':
      return layer;
  }
}
