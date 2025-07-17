import type { FeatureCollection, Polygon, MultiPolygon } from 'geojson';

import type { CartoKitLayer, CartoKitDotDensityLayer } from '$lib/types';
import generateDotDensityPointsSrc from '$lib/stdlib/dot-density?raw';
import { selectQuantitativeAttribute } from '$lib/utils/geojson';
import { deriveDotDensityStartingValue } from '$lib/interaction/geometry';
import { parseStringToTransformation } from '$lib/utils/parse';
import { randomColor } from '$lib/utils/color';
import { DEFAULT_OPACITY } from '$lib/utils/constants';
import { generateDotDensityPoints } from '$lib/stdlib/dot-density';

/**
 * Transition a @see{CartoKitLayer} to a @see{CartoKitDotDensityLayer}.
 *
 * @param {CartoKitLayer} layer — The @see{CartoKitLayer} to transition.
 * @returns {Object} — The transitioned @see{CartoKitDotDensityLayer} and a
 * Boolean flag indicating whether the layer needs to be redrawn.
 */
export function transitionToDotDensity(layer: CartoKitLayer): {
  targetLayer: CartoKitDotDensityLayer;
  redraw: boolean;
} {
  switch (layer.type) {
    case 'Choropleth': {
      const attribute = layer.style.fill.attribute;
      const dotValue = deriveDotDensityStartingValue(
        layer.data.sourceGeojson.features,
        attribute
      );

      const targetLayer: CartoKitDotDensityLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Dot Density',
        data: {
          url: layer.data.url,
          fileName: layer.data.fileName,
          sourceGeojson: layer.data.sourceGeojson,
          geojson: generateDotDensityPoints(
            layer.data.sourceGeojson as FeatureCollection<
              Polygon | MultiPolygon
            >,
            attribute,
            dotValue
          ),
          transformations: [
            ...layer.data.transformations,
            {
              ...parseStringToTransformation(
                generateDotDensityPointsSrc,
                'geometric'
              ),
              args: [attribute, dotValue]
            }
          ]
        },
        style: {
          dots: {
            attribute,
            size: 1,
            value: dotValue
          },
          fill: {
            type: 'Constant',
            color: randomColor(),
            opacity: layer.style.fill.opacity
          },
          stroke: layer.style.stroke
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Dot Density':
      return {
        targetLayer: layer,
        redraw: false
      };
    case 'Heatmap':
    case 'Line':
      throw new Error(
        `Unsupported geometry transition. Transition initiated from ${layer.type} to Dot Density.`
      );
    case 'Point': {
      const attribute = selectQuantitativeAttribute(
        layer.data.geojson.features
      );
      const dotValue = deriveDotDensityStartingValue(
        layer.data.geojson.features,
        attribute
      );

      // Replace the centroid transformation with a dot density transformation.
      const generateDotDensityPointsTransformation = {
        ...parseStringToTransformation(
          generateDotDensityPointsSrc,
          'geometric'
        ),
        args: [attribute, dotValue]
      };

      const deriveCentroidsTransformationIndex =
        layer.data.transformations.findIndex(
          (transformation) => transformation.name === 'deriveCentroids'
        );

      const transformations = [...layer.data.transformations].splice(
        deriveCentroidsTransformationIndex,
        1,
        generateDotDensityPointsTransformation
      );

      const targetLayer: CartoKitDotDensityLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Dot Density',
        data: {
          url: layer.data.url,
          fileName: layer.data.fileName,
          sourceGeojson: layer.data.sourceGeojson,
          geojson: generateDotDensityPoints(
            layer.data.sourceGeojson as FeatureCollection<
              Polygon | MultiPolygon
            >,
            attribute,
            dotValue
          ),
          transformations
        },
        style: {
          dots: {
            attribute,
            size: 1,
            value: dotValue
          },
          fill: {
            type: 'Constant',
            color: randomColor(),
            opacity: layer.style.fill?.opacity ?? DEFAULT_OPACITY
          },
          stroke: layer.style.stroke
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Proportional Symbol': {
      const attribute = layer.style.size.attribute;
      const dotValue = deriveDotDensityStartingValue(
        layer.data.sourceGeojson.features,
        layer.style.size.attribute
      );

      // Replace the centroid transformation with a dot density transformation.
      const generateDotDensityPointsTransformation = {
        ...parseStringToTransformation(
          generateDotDensityPointsSrc,
          'geometric'
        ),
        args: [attribute, dotValue]
      };

      const deriveCentroidsTransformationIndex =
        layer.data.transformations.findIndex(
          (transformation) => transformation.name === 'deriveCentroids'
        );

      const transformations = [...layer.data.transformations].splice(
        deriveCentroidsTransformationIndex,
        1,
        generateDotDensityPointsTransformation
      );

      const targetLayer: CartoKitDotDensityLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Dot Density',
        data: {
          url: layer.data.url,
          fileName: layer.data.fileName,
          sourceGeojson: layer.data.sourceGeojson,
          geojson: generateDotDensityPoints(
            layer.data.sourceGeojson as FeatureCollection<
              Polygon | MultiPolygon
            >,
            attribute,
            dotValue
          ),
          transformations
        },
        style: {
          dots: {
            attribute,
            size: 1,
            value: dotValue
          },
          fill: {
            type: 'Constant',
            color: randomColor(),
            opacity: layer.style.fill?.opacity ?? DEFAULT_OPACITY
          },
          stroke: layer.style.stroke
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Polygon': {
      const attribute = selectQuantitativeAttribute(
        layer.data.sourceGeojson.features
      );
      const dotValue = deriveDotDensityStartingValue(
        layer.data.sourceGeojson.features,
        attribute
      );

      const targetLayer: CartoKitDotDensityLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Dot Density',
        data: {
          url: layer.data.url,
          fileName: layer.data.fileName,
          sourceGeojson: layer.data.sourceGeojson,
          geojson: generateDotDensityPoints(
            layer.data.sourceGeojson as FeatureCollection<
              Polygon | MultiPolygon
            >,
            attribute,
            dotValue
          ),
          transformations: [
            ...layer.data.transformations,
            {
              ...parseStringToTransformation(
                generateDotDensityPointsSrc,
                'geometric'
              ),
              args: [attribute, dotValue]
            }
          ]
        },
        style: {
          dots: {
            attribute,
            size: 1,
            value: dotValue
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
  }
}
