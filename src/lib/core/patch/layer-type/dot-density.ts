import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';

import { deriveDotDensityStartingValue } from '$lib/interaction/geometry';
import { generateDotDensityPoints } from '$lib/stdlib/dot-density';
import generateDotDensityPointsSrc from '$lib/stdlib/dot-density?raw';
import type { CartoKitDotDensityLayer, CartoKitLayer } from '$lib/types';
import { selectQuantitativeAttribute } from '$lib/utils/attributes';
import { randomColor } from '$lib/utils/color';
import { DEFAULT_SIZE } from '$lib/utils/constants';
import { parseStringToTransformation } from '$lib/utils/parse';

/**
 * Patch a {@link CartoKitLayer} to a {@link CartoKitDotDensityLayer}.
 *
 * @param layer The {@link CartoKitLayer} to patch.
 * @returns The patched {@link CartoKitDotDensityLayer}.
 */
export function patchDotDensity(layer: CartoKitLayer): CartoKitDotDensityLayer {
  switch (layer.type) {
    case 'Choropleth': {
      let source = layer.source;
      const attribute = layer.style.fill.attribute;
      const dotValue = deriveDotDensityStartingValue(layer.id, attribute);

      if (layer.source.type === 'geojson') {
        const transformations = [
          ...layer.source.transformations,
          {
            ...parseStringToTransformation(
              generateDotDensityPointsSrc,
              'geometric',
              'generateDotDensityPoints'
            ),
            args: [attribute, dotValue]
          }
        ];

        source = {
          ...layer.source,
          data: generateDotDensityPoints(
            layer.source.sourceData as FeatureCollection<
              Polygon | MultiPolygon
            >,
            attribute,
            dotValue
          ),
          transformations
        };
      }

      const targetLayer: CartoKitDotDensityLayer = {
        ...layer,
        type: 'Dot Density',
        source,
        style: {
          ...layer.style,
          dot: {
            attribute,
            value: dotValue
          },
          fill: {
            type: 'Constant',
            color: randomColor(),
            opacity: layer.style.fill.opacity,
            visible: layer.style.fill.visible
          },
          size: DEFAULT_SIZE
        }
      };

      return targetLayer;
    }
    case 'Dot Density':
      return layer;
    case 'Heatmap':
    case 'Line':
      throw new Error(
        `Unsupported geometry transition. Transition initiated from ${layer.type} to Dot Density.`
      );
    case 'Point': {
      let source = layer.source;
      const attribute = selectQuantitativeAttribute(layer.source);
      const dotValue = deriveDotDensityStartingValue(layer.id, attribute);

      if (layer.source.type === 'geojson') {
        // Replace the centroid transformation with a dot density transformation.
        const generateDotDensityPointsTransformation = {
          ...parseStringToTransformation(
            generateDotDensityPointsSrc,
            'geometric',
            'generateDotDensityPoints'
          ),
          args: [attribute, dotValue]
        };

        const transformations = [...layer.source.transformations].splice(
          layer.source.transformations.findIndex(
            (transformation) => transformation.name === 'deriveCentroids'
          ),
          1,
          generateDotDensityPointsTransformation
        );

        source = {
          ...layer.source,
          data: generateDotDensityPoints(
            layer.source.sourceData as FeatureCollection<
              Polygon | MultiPolygon
            >,
            attribute,
            dotValue
          ),
          transformations
        };
      }

      const targetLayer: CartoKitDotDensityLayer = {
        ...layer,
        type: 'Dot Density',
        source,
        style: {
          ...layer.style,
          dot: {
            attribute,
            value: dotValue
          },
          fill:
            layer.style.fill.type === 'Constant'
              ? layer.style.fill
              : {
                  type: 'Constant',
                  color: randomColor(),
                  opacity: layer.style.fill.opacity,
                  visible: layer.style.fill.visible
                }
        }
      };

      return targetLayer;
    }
    case 'Polygon': {
      let source = layer.source;
      const attribute = selectQuantitativeAttribute(layer.source);
      const dotValue = deriveDotDensityStartingValue(layer.id, attribute);

      if (layer.source.type === 'geojson') {
        source = {
          ...layer.source,
          data: generateDotDensityPoints(
            layer.source.sourceData as FeatureCollection<
              Polygon | MultiPolygon
            >,
            attribute,
            dotValue
          ),
          transformations: [
            ...layer.source.transformations,
            {
              ...parseStringToTransformation(
                generateDotDensityPointsSrc,
                'geometric',
                'generateDotDensityPoints'
              ),
              args: [attribute, dotValue]
            }
          ]
        };
      }

      const targetLayer: CartoKitDotDensityLayer = {
        ...layer,
        type: 'Dot Density',
        source,
        style: {
          ...layer.style,
          dot: {
            attribute,
            value: dotValue
          },
          size: DEFAULT_SIZE
        }
      };

      return targetLayer;
    }
    case 'Proportional Symbol': {
      let source = layer.source;
      const dotValue = deriveDotDensityStartingValue(
        layer.id,
        layer.style.size.attribute
      );

      if (layer.source.type === 'geojson') {
        const transformations = [...layer.source.transformations].splice(
          // Replace the deriveCentroids transformation with the generateDotDensityPoints transformation.
          layer.source.transformations.findIndex(
            (transformation) => transformation.name === 'deriveCentroids'
          ),
          1,
          {
            ...parseStringToTransformation(
              generateDotDensityPointsSrc,
              'geometric',
              'generateDotDensityPoints'
            ),
            args: [layer.style.size.attribute, dotValue]
          }
        );

        source = {
          ...layer.source,
          data: generateDotDensityPoints(
            layer.source.sourceData as FeatureCollection<
              Polygon | MultiPolygon
            >,
            layer.style.size.attribute,
            dotValue
          ),
          transformations
        };
      }

      const targetLayer: CartoKitDotDensityLayer = {
        ...layer,
        type: 'Dot Density',
        source,
        style: {
          ...layer.style,
          dot: {
            attribute: layer.style.size.attribute,
            value: dotValue
          },
          fill:
            layer.style.fill.type === 'Constant'
              ? layer.style.fill
              : {
                  type: 'Constant',
                  color: randomColor(),
                  opacity: layer.style.fill.opacity,
                  visible: layer.style.fill.visible
                },
          size: DEFAULT_SIZE
        }
      };

      return targetLayer;
    }
  }
}
