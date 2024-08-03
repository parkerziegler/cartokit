import { feature, featureCollection } from '@turf/helpers';
import type { GeoJSON, Feature, FeatureCollection, Geometry } from 'geojson';

import {
  isPropertyCategorical,
  isPropertyQuantitative
} from '$lib/utils/property';

/**
 * Normalize a GeoJSON Geometry, GeometryCollection, or Feature to a GeoJSON
 * FeatureCollection.
 *
 * @param {GeoJSON} geojson - The GeoJSON object to normalize.
 * @returns {FeatureCollection} – A GeoJSON FeatureCollection.
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
 * Get the Geometry type of a FeatureCollection.
 *
 * @param {FeatureCollection} featureCollection - The FeatureCollection to inspect.
 * @returns {Geometry['type']} – The Geometry type of the FeatureCollection.
 */
export function getFeatureCollectionGeometryType(
  featureCollection: FeatureCollection
): Geometry['type'] {
  return (
    featureCollection.features?.[0]?.geometry?.type ?? 'GeometryCollection'
  );
}

/**
 * Select the first quantitative attribute from a GeoJSON FeatureCollection.
 *
 * @param {Feature[]} features– The Features of a GeoJSON FeatureCollection.
 * @returns {string} – The name of the first quantitative attribute found in the
 * GeoJSON FeatureCollection.
 */
export function selectQuantitativeAttribute(features: Feature[]): string {
  for (const property in features[0].properties) {
    if (isPropertyQuantitative(features[0].properties[property])) {
      return property;
    }
  }

  // TODO: Catch this error and display a message prompting the user
  // to select a layer type that does not require a quantitative attribute.
  throw new Error('No quantitative attributes found in dataset.');
}

/**
 * Select the first categorical attribute from a GeoJSON FeatureCollection.
 *
 * @param {Feature[]} features – The Features of a GeoJSON FeatureCollection.
 * @returns {string} – The name of the first categorical attribute found in the GeoJSON
 * FeatureCollection.
 */
export function selectCategoricalAttribute(features: Feature[]): string {
  for (const property in features[0].properties) {
    if (isPropertyCategorical(features[0].properties[property])) {
      return property;
    }
  }

  // TODO: Catch this error and display a message prompting the user
  // to select a layer type that does not require a categorical attribute.
  throw new Error('No cateogrical attributes found in dataset.');
}

/**
 * Enumerate the categories of a given attribute in a GeoJSON FeatureCollection.
 *
 * @param {Object[]} features – The GeoJSON dataset.
 * @param {string} attribute – The attribute to probe for categories.
 * @returns {string[]} – The categories of the attribute.
 */
export function enumerateAttributeCategories(
  features: Feature[],
  attribute: string
): string[] {
  const categories = new Set<string>();

  for (const feature of features) {
    if (
      feature.properties?.[attribute] &&
      !categories.has(feature.properties[attribute])
    ) {
      categories.add(feature.properties[attribute]);
    }
  }

  return Array.from(categories);
}
