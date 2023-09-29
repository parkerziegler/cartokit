import type { Transformation } from '$lib/types/transformation';

export function transformPolygonsToCentroids(): Transformation {
  return {
    name: 'transformPolygonsToCentroids',
    definition: `
    function transformPolygonsToCentroids(geoJSON) {
      const centroids = geoJSON.features.map((feature) => {
        return turf.feature(turf.centroid(feature).geometry, feature.properties);
      });

      return turf.featureCollection(centroids)
    }`,
    type: 'geometric'
  };
}

export function transformDotDensity(
  attribute: string,
  dotValue: number
): Transformation {
  return {
    name: 'transformDotDensity',
    definition: `
    function transformDotDensity(geoJSON) {
      const dots = geoJSON.features.flatMap((feature) => {
        const numPoints = Math.floor(
          feature.properties['${attribute}'] / ${dotValue}
        );

        const bbox = turf.bbox(feature);
        const selectedFeatures = [];

        while (selectedFeatures.length < numPoints) {
          const candidate = turf.randomPoint(1, { bbox }).features[0];

          if (turf.booleanWithin(candidate, feature)) {
            selectedFeatures.push(candidate);
          }
        }

        return selectedFeatures.flatMap((point) => {
          return turf.feature(point.geometry, feature.properties);
        });
      });

      return turf.featureCollection(dots);
    }`,
    type: 'geometric'
  };
}
