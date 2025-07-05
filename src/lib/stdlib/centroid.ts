import * as turf from '@turf/turf';
import type * as GeoJSON from 'geojson';

/**
 * Derive centroids for a GeoJSON FeatureCollection.
 *
 * @param geojson – The input GeoJSON FeatureCollection.
 *
 * @returns – A GeoJSON FeatureCollection of centroids.
 */
export function deriveCentroids(
  geojson: GeoJSON.FeatureCollection
): GeoJSON.FeatureCollection {
  const centroids = geojson.features.reduce<GeoJSON.Feature[]>(
    (acc, { geometry, properties }) => {
      if (
        !geometry ||
        ('coordinates' in geometry && geometry.coordinates.length === 0)
      ) {
        return acc;
      }

      return [
        ...acc,
        turf.feature(turf.centroid(geometry).geometry, properties)
      ];
    },
    []
  );

  return turf.featureCollection(centroids);
}
