import { bbox } from '@turf/bbox';
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';
import { centroid } from '@turf/centroid';
import { feature, featureCollection } from '@turf/helpers';
import { randomPoint } from '@turf/random';
import * as d3 from 'd3';
import type {
  Feature,
  FeatureCollection,
  Point,
  MultiPolygon,
  Polygon
} from 'geojson';
import type { ExpressionSpecification } from 'maplibre-gl';

import type { CartoKitProportionalSymbolLayer } from '$lib/types';

/**
 * Derive a MapLibre GL JS expression for a proportional symbol radius scale.
 *
 * @param layer – The CartoKitProportionalSymbolLayer to derive a radius scale for.
 *
 * @returns – A MapLibre GL JS expression for a proportional symbol radius scale.
 */
export function deriveSize(
  layer: CartoKitProportionalSymbolLayer
): ExpressionSpecification {
  const {
    data: {
      geojson: { features }
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
 * @param features – The input features to derive centroids for.
 *
 * @returns – A FeatureCollection of centroids.
 */
export function deriveCentroids(features: Feature[]): FeatureCollection {
  return featureCollection(
    features.map(({ geometry, properties }) =>
      feature(centroid(geometry).geometry, properties)
    )
  );
}

/**
 * Generate dots for a dot density layer.
 *
 * @param {Feature<Polygon | MultiPolygon>[]} features – The polygon features
 * within which to generate dots.
 * @param {string} attribute – The attribute being visualized.
 * @param {number} value – The dot value of the dot density layer.
 * @returns {FeatureCollection<Point>} – A FeatureCollection of dots.
 */
export function generateDotDensityPoints(
  features: Feature<Polygon | MultiPolygon>[],
  attribute: string,
  value: number
): FeatureCollection<Point> {
  return featureCollection(
    features.flatMap(({ geometry, properties }) => {
      const numPoints = Math.floor(properties?.[attribute] / value) ?? 0;

      // Obtain the bounding box of the polygon.
      const boundingBox = bbox(geometry);

      // Begin "throwing" random points within the bounding box, keeping them only
      // if they fall within the polygon.
      const selectedFeatures: Feature<Point>[] = [];

      while (selectedFeatures.length < numPoints) {
        const candidate = randomPoint(1, { bbox: boundingBox }).features[0];

        if (booleanPointInPolygon(candidate, geometry)) {
          selectedFeatures.push(candidate);
        }
      }

      return selectedFeatures.map((point) =>
        feature(point.geometry, properties)
      );
    })
  );
}

/**
 * Derive a starting dot value for a dot density layer. This value represents
 * the ratio of dots to data value, e.g., 1 dot = 100 people.
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
