import type { CartoKitLayer, CartoKitPointLayer } from '$lib/types';
import { deriveCentroids } from '$lib/stdlib/centroid';
import deriveCentroidsSrc from '$lib/stdlib/centroid?raw';
import { randomColor } from '$lib/utils/color';
import { parseStringToTransformation } from '$lib/utils/parse';
import {
  DEFAULT_OPACITY,
  DEFAULT_SIZE,
  DEFAULT_STROKE,
  DEFAULT_STROKE_WIDTH
} from '$lib/utils/constants';

/**
 * Patch a {@link CartoKitLayer} to a {@link CartoKitPointLayer}.
 *
 * @param layer The {@link CartoKitLayer} to patch.
 * @returns The patched {@link CartoKitPointLayer}.
 */
export function patchPoint(layer: CartoKitLayer): CartoKitPointLayer {
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

      const targetLayer: CartoKitPointLayer = {
        ...layer,
        type: 'Point',
        source,
        style: {
          ...layer.style,
          size: DEFAULT_SIZE
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
          data: deriveCentroids(layer.source.sourceData),
          transformations
        };
      }

      const targetLayer: CartoKitPointLayer = {
        ...layer,
        type: 'Point',
        source,
        style: {
          fill: layer.style.fill,
          stroke: layer.style.stroke,
          size: layer.style.size
        }
      };

      return targetLayer;
    }
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

      const targetLayer: CartoKitPointLayer = {
        ...layer,
        type: 'Point',
        source,
        style: {
          ...layer.style,
          size: DEFAULT_SIZE,
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
    case 'Point':
      return layer;
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
