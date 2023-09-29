import type { FeatureCollection } from 'geojson';
import uniqueId from 'lodash.uniqueid';
import kebabCase from 'lodash.kebabcase';

import type { CartoKitLayer } from '$lib/types/CartoKitLayer';
import { randomColor } from '$lib/utils/color';
import {
  DEFAULT_OPACITY,
  DEFAULT_RADIUS,
  DEFAULT_STROKE_OPACITY,
  DEFAULT_STROKE_WIDTH
} from '$lib/utils/constants';
import { getLayerGeometryType } from '$lib/utils/geojson';

/**
 * Get the layer ids for all instrumented layers associated with a given layer.
 *
 * @param layer — the CartoKit layer that the instrumented layers are associated with.
 *
 * @returns – an array of instrumented layer ids.
 */
export function getInstrumetedLayerIds(layer: CartoKitLayer): string[] {
  switch (layer.type) {
    case 'Fill':
    case 'Choropleth':
      return [`${layer.id}-stroke`, `${layer.id}-hover`, `${layer.id}-select`];
    case 'Point':
    case 'Proportional Symbol':
      return [`${layer.id}-hover`, `${layer.id}-select`];
    case 'Dot Density':
      return [
        `${layer.id}-outlines`,
        `${layer.id}-outlines-hover`,
        `${layer.id}-outlines-select`
      ];
  }
}

/**
 * Generate a CartoKitLayer for a given GeoJSON dataset, using the dataset's
 * Geometry type to select the appropriate member from the CartoKitLayer union.
 *
 * @param featureCollection – The GeoJSON FeatureCollection
 * @returns – A default CartoKitLayer appropriate for the input geometry type.
 */
export function generateCartoKitLayer(
  featureCollection: FeatureCollection,
  options: { displayName: string; url?: string; fileName?: string }
): CartoKitLayer {
  const geometryType = getLayerGeometryType(featureCollection);
  const color = randomColor();

  switch (geometryType) {
    case 'Point':
    case 'MultiPoint':
      return {
        id: uniqueId(`${kebabCase(options.displayName)}__`),
        displayName: options.displayName,
        type: 'Point',
        data: {
          geoJSON: featureCollection,
          rawGeoJSON: featureCollection,
          fileName: options.fileName,
          url: options.url,
          transformations: []
        },
        style: {
          size: DEFAULT_RADIUS,
          fill: {
            color,
            opacity: DEFAULT_OPACITY
          },
          stroke: {
            color,
            width: DEFAULT_STROKE_WIDTH,
            opacity: DEFAULT_STROKE_OPACITY
          }
        }
      };
    case 'Polygon':
    case 'MultiPolygon':
      return {
        id: uniqueId(`${kebabCase(options.displayName)}__`),
        displayName: options.displayName,
        type: 'Fill',
        data: {
          geoJSON: featureCollection,
          rawGeoJSON: featureCollection,
          fileName: options.fileName,
          url: options.url,
          transformations: []
        },
        style: {
          fill: {
            color,
            opacity: DEFAULT_OPACITY
          },
          stroke: {
            color,
            width: DEFAULT_STROKE_WIDTH,
            opacity: DEFAULT_STROKE_OPACITY
          }
        }
      };
    default:
      throw new Error(`Unsupported geometry type: ${geometryType}.`);
  }
}
