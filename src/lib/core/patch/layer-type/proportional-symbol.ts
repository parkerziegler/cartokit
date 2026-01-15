import type {
  CartoKitLayer,
  CartoKitProportionalSymbolLayer
} from '$lib/types';
import {
  DEFAULT_FILL,
  DEFAULT_MAX_SIZE,
  DEFAULT_MIN_SIZE,
  DEFAULT_OPACITY,
  DEFAULT_STROKE,
  DEFAULT_STROKE_WIDTH
} from '$lib/utils/constants';
import { selectQuantitativeAttribute } from '$lib/utils/geojson';
import { deriveCentroids } from '$lib/stdlib/centroid';
import deriveCentroidsSrc from '$lib/stdlib/centroid?raw';
import { parseStringToTransformation } from '$lib/utils/parse';
import { randomColor } from '$lib/utils/color';

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
              ...parseStringToTransformation(
                deriveCentroidsSrc,
                'geometric',
                'deriveCentroids'
              ),
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
        },
        layout: layer.layout
      };

      return targetLayer;
    }
    case 'Dot Density': {
      // Replace the dot density transformation with a centroid transformation.
      const deriveCentroidsTransformation = {
        ...parseStringToTransformation(
          deriveCentroidsSrc,
          'geometric',
          'deriveCentroids'
        ),
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
            attribute: layer.style.dot.attribute,
            min: DEFAULT_MIN_SIZE,
            max: DEFAULT_MAX_SIZE
          },
          fill: layer.style.fill,
          stroke: layer.style.stroke
        },
        layout: layer.layout
      };

      return targetLayer;
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
        },
        layout: layer.layout
      };

      return targetLayer;
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
              ...parseStringToTransformation(
                deriveCentroidsSrc,
                'geometric',
                'deriveCentroids'
              ),
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
            opacity: DEFAULT_OPACITY,
            visible: true
          },
          stroke: layer.style.stroke
        },
        layout: layer.layout
      };

      return targetLayer;
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
        },
        layout: layer.layout
      };

      return targetLayer;
    }
    case 'Proportional Symbol':
      return layer;
  }
}
