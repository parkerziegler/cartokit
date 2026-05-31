import * as turf from '@turf/turf';
import type { GeoJSON, FeatureCollection, Geometry } from 'geojson';

/**
 * Normalize a GeoJSON Geometry, GeometryCollection, or Feature to a GeoJSON
 * FeatureCollection.
 *
 * @param geojson The {@link GeoJSON} object to normalize.
 * @returns A {@link FeatureCollection}.
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
      return turf.featureCollection([turf.feature(geojson)]);
    case 'GeometryCollection':
      return turf.featureCollection(
        geojson.geometries.map((geometry) => turf.feature(geometry))
      );
    case 'Feature':
      return turf.featureCollection([geojson]);
    case 'FeatureCollection':
      return geojson;
  }
}

/**
 * Get the Geometry type of a FeatureCollection.
 *
 * @param featureCollection The {@link FeatureCollection} to inspect.
 * @returns The {@link Geometry['type']} type of the {@link FeatureCollection}.
 */
export function getFeatureCollectionGeometryType(
  featureCollection: FeatureCollection
): Geometry['type'] {
  return (
    featureCollection.features?.[0]?.geometry?.type ?? 'GeometryCollection'
  );
}
