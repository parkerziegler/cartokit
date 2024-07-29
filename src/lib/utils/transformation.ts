import type { Transformation } from '$lib/types';

export function transformGeometryToCentroids(): Transformation {
  return {
    name: 'transformGeometryToCentroids',
    definition: `
    function transformGeometryToCentroids(geojson) {
      return turf.featureCollection(
        geojson.features.map((feature) =>
          turf.feature(turf.centroid(feature).geometry, feature.properties)
        )
      );
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
    function transformDotDensity(geojson) {
      const dots = geojson.features.flatMap((feature) => {
        const numPoints = Math.floor(
          feature.properties['${attribute}'] / ${dotValue}
        );

        const bbox = turf.bbox(feature);
        const selectedFeatures = [];

        while (selectedFeatures.length < numPoints) {
          const candidate = turf.randomPoint(1, { bbox }).features[0];

          if (turf.booleanPointInPolygon(candidate, feature)) {
            selectedFeatures.push(candidate);
          }
        }

        return selectedFeatures.map((point) =>
          turf.feature(point.geometry, feature.properties)
        );
      });

      return turf.featureCollection(dots);
    }`,
    type: 'geometric'
  };
}
