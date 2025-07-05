import * as d3 from 'd3';
import type { Feature } from 'geojson';
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
  return max * 0.01 || 1;
}
