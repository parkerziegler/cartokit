import type { Transformation } from '$lib/types';

/**
 * A @see{Transformation} that takes the centroid of each feature in a GeoJSON
 * FeatureCollection and returns a new FeatureCollection.
 */
export const transformGeometryToCentroids: Transformation = {
  name: 'transformGeometryToCentroids',
  params: ['geojson'],
  definition: `
      const centroids = geojson.features.map((feature) =>
        turf.feature(turf.centroid(feature).geometry, feature.properties)
      );

      return turf.featureCollection(centroids);
    `,
  type: 'geometric'
};

/**
 * A @see{Transformation} that takes a GeoJSON FeatureCollection and returns a
 * new FeatureCollection of points for a Dot Density layer.
 */
export const transformDotDensity: Transformation = {
  name: 'transformDotDensity',
  params: ['geojson', 'attribute', 'dotValue'],
  definition: `
      const dots = geojson.features.flatMap((feature) => {
        const numPoints = Math.floor(
          feature.properties[attribute] / dotValue
        );

        const bbox = turf.bbox(feature);
        const selectedDots = [];

        while (selectedDots.length < numPoints) {
          const candidate = turf.randomPoint(1, { bbox }).features[0];

          if (turf.booleanPointInPolygon(candidate, feature)) {
            selectedDots.push(candidate);
          }
        }

        const dotsInPolygon = selectedDots.map((point) =>
          turf.feature(point.geometry, feature.properties)
        );

        return dotsInPolygon;
      });

      return turf.featureCollection(dots);`,
  type: 'geometric'
};
