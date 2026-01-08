import * as turf from '@turf/turf';
import type * as GeoJSON from 'geojson';

/**
 * Generate dots for a dot density layer.
 *
 * @param geojson The input {@link GeoJSON.FeatureCollection}.
 * @param attribute The attribute being visualized.
 * @param dotValue The dot value of the dot density layer.
 *
 * @returns A {@link GeoJSON.FeatureCollection} of dots.
 */
export function generateDotDensityPoints(
  geojson: GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon>,
  attribute: string,
  dotValue: number
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  const dots = geojson.features.reduce<GeoJSON.Feature<GeoJSON.Point>[]>(
    (acc, { geometry, properties }) => {
      if (
        !geometry ||
        ('coordinates' in geometry && geometry.coordinates.length === 0)
      ) {
        return acc;
      }

      const numPoints = Math.floor(properties?.[attribute] / dotValue) ?? 0;

      // Obtain the bounding box of the polygon.
      const boundingBox = turf.bbox(geometry);

      // Begin "throwing" random points within the bounding box, keeping them only
      // if they fall within the polygon.
      const selectedFeatures: GeoJSON.Feature<GeoJSON.Point>[] = [];

      while (selectedFeatures.length < numPoints) {
        const candidate = turf.randomPoint(1, { bbox: boundingBox })
          .features[0];

        if (turf.booleanPointInPolygon(candidate, geometry)) {
          selectedFeatures.push(candidate);
        }
      }

      return [
        ...acc,
        ...selectedFeatures.map((point) =>
          turf.feature(point.geometry, properties)
        )
      ];
    },
    []
  );

  return turf.featureCollection(dots);
}
