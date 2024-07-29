import { feature, featureCollection } from '@turf/helpers';
import type { GeoJSON, Feature, FeatureCollection, Geometry } from 'geojson';

import {
  isPropertyCategorical,
  isPropertyQuantitative
} from '$lib/utils/property';

/**
 * Normalize an arbitrary GeoJSON object to a FeatureCollection.
 *
 * @param geojson - The GeoJSON object to normalize.
 * @returns – A GeoJSON FeatureCollection.
 */
export function normalizeGeoJSONToFeatureCollection(
  geojson: GeoJSON
): FeatureCollection {
  switch (geojson.type) {
    case 'Point':
    case 'MultiPoint':
    case 'LineString':
    case 'MultiLineString':
    case 'Polygon':
    case 'MultiPolygon':
      return featureCollection([feature(geojson)]);
    case 'GeometryCollection':
      return featureCollection(
        geojson.geometries.map((geometry) => feature(geometry))
      );
    case 'Feature':
      return featureCollection([geojson]);
    case 'FeatureCollection':
      return geojson;
  }
}

/**
 * Get the Geometry type of the layer by reading its first Feature.
 *
 * @param featureCollection - The FeatureCollection to inspect.
 * @returns – The type of the first Feature in the FeatureCollection.
 */
export function getLayerGeometryType(
  featureCollection: FeatureCollection
): Geometry['type'] {
  return (
    featureCollection.features?.[0]?.geometry?.type ?? 'GeometryCollection'
  );
}

/**
 * Select a numeric attribute from a GeoJSON dataset.
 *
 * @param data – The GeoJSON dataset.
 *
 * @returns – The name of the first numeric attribute found in the input GeoJSON
 * dataset.
 */
export function selectQuantitativeAttribute(data: Feature[]): string {
  for (const property in data[0].properties) {
    if (isPropertyQuantitative(data[0].properties[property])) {
      return property;
    }
  }

  // TODO: Catch this error and display a message prompting the user
  // to select a layer type that does not require a numeric attribute.
  throw new Error('No numeric attributes found in dataset.');
}

/**
 * Select a categorical attribute from a GeoJSON dataset.
 *
 * @param data – The GeoJSON dataset.
 *
 * @returns – The name of the first categorical attribute found in the input
 * GeoJSON dataset.
 */
export function selectCategoricalAttribute(data: Feature[]): string {
  for (const property in data[0].properties) {
    if (isPropertyCategorical(data[0].properties[property])) {
      return property;
    }
  }

  // TODO: Catch this error and display a message prompting the user
  // to select a layer type that does not require a categorical attribute.
  throw new Error('No cateogrical attributes found in dataset.');
}

export function enumerateAttributeCategories(
  data: Feature[],
  attribute: string
): string[] {
  const categories = new Set<string>();

  for (const feature of data) {
    if (
      feature.properties?.[attribute] &&
      !categories.has(feature.properties[attribute])
    ) {
      categories.add(feature.properties[attribute]);
    }
  }

  return Array.from(categories);
}
