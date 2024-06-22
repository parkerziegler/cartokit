import { bbox } from '@turf/bbox';
import { booleanWithin } from '@turf/boolean-within';
import { centroid } from '@turf/centroid';
import { feature, featureCollection } from '@turf/helpers';
import { randomPoint } from '@turf/random';
import * as d3 from 'd3';
import type { Feature, FeatureCollection } from 'geojson';
import type { ExpressionSpecification } from 'maplibre-gl';

import type { CartoKitProportionalSymbolLayer } from '$lib/types/CartoKitLayer';

/**
 * Derive a MapLibre GL JS expression for a proportional symbol radius scale.
 *
 * @param layer – The CartoKitProportionalSymbolLayer to derive a radius scale for.
 *
 * @returns – a MapLibre GL JS expression for a proportional symbol radius scale.
 */
export function deriveSize(
  layer: CartoKitProportionalSymbolLayer
): ExpressionSpecification {
  const {
    data: {
      geoJSON: { features }
    },
    style: {
      size: { attribute, min: rMin, max: rMax }
    }
  } = layer;
  const extent = d3.extent(features, (d) =>
    Math.sqrt(d.properties?.[attribute] ?? 0)
  );
  const [min, max] = [extent[0] ?? 0, extent[1] ?? 1];

  return [
    'interpolate',
    ['linear'],
    ['sqrt', ['get', attribute]],
    min,
    rMin,
    max,
    rMax
  ];
}

/**
 * Derive centroids for a set of GeoJSON features.
 *
 * @param features – the input features to derive centroids for.
 *
 * @returns – a FeatureCollection of centroids.
 */
export function deriveCentroids(features: Feature[]): FeatureCollection {
  return featureCollection(
    features.map(({ geometry, properties }) =>
      feature(centroid(geometry).geometry, properties)
    )
  );
}

interface GenerateDotDensityPointsParams {
  features: Feature[];
  attribute: string;
  value: number;
}

/**
 * Generate dots for a dot density layer.
 *
 * @param features – the polygon features within which to generate dots.
 * @param attribute – the attribute being visualized.
 * @param value – the value of dots to attribute value.
 *
 * @returns – a FeatureCollection of dots.
 */
export function generateDotDensityPoints({
  features,
  attribute,
  value
}: GenerateDotDensityPointsParams): FeatureCollection {
  const dots = features.flatMap((f) => {
    const numPoints = Math.floor(f.properties?.[attribute] / value) ?? 0;

    // Obtain the bounding box of the polygon.
    const boundingBox = bbox(f);

    // Begin "throwing" random points within the bounding box,
    // keeping them only if they fall within the polygon.
    const selectedFeatures: Feature[] = [];

    while (selectedFeatures.length < numPoints) {
      const candidate = randomPoint(1, { bbox: boundingBox }).features[0];

      if (booleanWithin(candidate, f)) {
        selectedFeatures.push(candidate);
      }
    }

    return selectedFeatures.flatMap((point) =>
      feature(point.geometry, f.properties)
    );
  });

  return featureCollection(dots);
}

/**
 * Derive a starting dot value for a dot density layer. This value represents the ratio
 * of dots to data value, e.g., 1 dot = 100 people.
 *
 * @param features – The GeoJSON features to derive a dot density value for.
 * @param attribute – The data attribute.
 *
 * @returns – A starting dot density value.
 */
export function deriveDotDensityStartingValue(
  features: Feature[],
  attribute: string
): number {
  const max = d3.max(features, (d) => d.properties?.[attribute] ?? 0);

  // Aim for a ratio where the number of dots is 1% of the max data value.
  return Math.floor(max / 100);
}
