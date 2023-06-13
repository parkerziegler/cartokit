import {
  feature as turfFeature,
  featureCollection as turfFeatureCollection
} from '@turf/helpers';
import type { GeoJSON, FeatureCollection, Geometry } from 'geojson';

import { isPropertyNumeric } from '$lib/utils/property';

/**
 * Normalize an arbitrary GeoJSON object to a FeatureCollection.
 *
 * @param geoJSON - The GeoJSON object to normalize.
 * @returns – A GeoJSON FeatureCollection.
 */
export function normalizeGeoJSONToFeatureCollection(
  geoJSON: GeoJSON
): FeatureCollection {
  switch (geoJSON.type) {
    case 'Point':
    case 'MultiPoint':
    case 'LineString':
    case 'MultiLineString':
    case 'Polygon':
    case 'MultiPolygon': {
      const feature = turfFeature(geoJSON);
      const featureCollection = turfFeatureCollection([feature]);

      return featureCollection;
    }
    case 'GeometryCollection': {
      const features = geoJSON.geometries.map((geometry) =>
        turfFeature(geometry)
      );
      const featureCollection = turfFeatureCollection(features);

      return featureCollection;
    }
    case 'Feature':
      return turfFeatureCollection([geoJSON]);
    case 'FeatureCollection':
      return geoJSON;
  }
}

/**
 * Get the type of the first Feature in a FeatureCollection.
 * Used to infer the type of the layer.
 *
 * @param featureCollection - The FeatureCollection to inspect.
 * @returns – The type of the first Feature in the FeatureCollection.
 */
export function getFeatureCollectionType(
  featureCollection: FeatureCollection
): Geometry['type'] {
  return featureCollection.features?.[0]?.geometry?.type;
}

/**
 * Select a numeric attribute from a GeoJSON dataset.
 *
 * @param data – The GeoJSON dataset.
 *
 * @returns – The name of the first numeric attribute found in the input GeoJSON dataset.
 */
export function selectNumericAttribute(data: GeoJSON.Feature[]): string {
  for (const property in data[0].properties) {
    if (isPropertyNumeric(data[0].properties[property])) {
      return property;
    }
  }

  // TODO: Catch this error and display a message prompting the user
  // to select a layer type that does not require a numeric attribute.
  throw new Error('No numeric attributes found in dataset.');
}
