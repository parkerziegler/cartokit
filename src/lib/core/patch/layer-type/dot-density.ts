import * as d3 from 'd3';
import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Polygon
} from 'geojson';

import { generateDotDensityPoints } from '$lib/stdlib/dot-density';
import generateDotDensityPointsSrc from '$lib/stdlib/dot-density?raw';
import type { CartoKitDotDensityLayer, CartoKitLayer } from '$lib/types';
import { randomColor } from '$lib/utils/color';
import { DEFAULT_SIZE } from '$lib/utils/constants';
import { selectQuantitativeAttribute } from '$lib/utils/geojson';
import { parseStringToTransformation } from '$lib/utils/parse';

/**
 * Obtain a starting dot value for a {@link CartoKitDotDensityLayer} based on
 * the maximum value of the data attribute.
 *
 * @param features The features of the {@link CartoKitDotDensityLayer}.
 * @param attribute The attribute of the {@link CartoKitDotDensityLayer} to use
 * for the starting dot value.
 * @returns The starting dot value.
 */
function deriveDotDensityStartingValue(
  features: Feature[],
  attribute: string
): number {
  const [min, max] = d3.extent(features, (d) => d.properties?.[attribute] ?? 0);

  // Aim for a ratio where the number of dots is 10% of the range.
  return (max - min) * 0.1 || 1;
}

/**
 * Patch a {@link CartoKitLayer} to a {@link CartoKitDotDensityLayer}.
 *
 * @param layer The {@link CartoKitLayer} to patch.
 * @returns The patched {@link CartoKitDotDensityLayer}.
 */
export function patchDotDensity(layer: CartoKitLayer): CartoKitDotDensityLayer {
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
          stroke: layer.style.stroke,
          size: DEFAULT_SIZE
        },
        layout: layer.layout
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
          stroke: layer.style.stroke,
          size: DEFAULT_SIZE
        },
        layout: layer.layout
      };

      return targetLayer;
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
          dot: {
            attribute,
            value: dotValue
          },
          fill: layer.style.fill,
          stroke: layer.style.stroke,
          size: DEFAULT_SIZE
        },
        layout: layer.layout
      };

      return targetLayer;
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
          stroke: layer.style.stroke,
          size: DEFAULT_SIZE
        },
        layout: layer.layout
      };

      return targetLayer;
    }
  }
}
