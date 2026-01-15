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
          size: DEFAULT_SIZE,
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
          size: layer.style.size,
          fill: layer.style.fill,
          stroke: layer.style.stroke
        },
        layout: layer.layout
      };

      return targetLayer;
    }
    case 'Heatmap': {
      const targetLayer: CartoKitPointLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Point',
        data: layer.data,
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
        },
        layout: layer.layout
      };

      return targetLayer;
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
          size: DEFAULT_SIZE,
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
    case 'Point':
      return layer;
    case 'Proportional Symbol': {
      const targetLayer: CartoKitPointLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Point',
        data: layer.data,
        style: {
          fill: layer.style.fill,
          stroke: layer.style.stroke,
          size: DEFAULT_SIZE
        },
        layout: layer.layout
      };

      return targetLayer;
    }
  }
}
