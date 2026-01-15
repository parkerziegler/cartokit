import * as d3 from 'd3';
import type * as GeoJSON from 'geojson';
import type { ExpressionSpecification } from 'maplibre-gl';

import type { CartoKitProportionalSymbolLayer } from '$lib/types';

/**
 * Derive a MapLibre GL JS expression for a proportional symbol radius scale.
 *
 * @param layer The {@link CartoKitProportionalSymbolLayer} to derive a radius
 * scale for.
 * @returns An {@link ExpressionSpecification} for a proportional symbol radius scale.
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
 * Obtain a starting dot value for a {@link CartoKitDotDensityLayer} based on
 * the maximum value of the data attribute.
 *
 * @param features The features of the {@link CartoKitDotDensityLayer}.
 * @param attribute The attribute of the {@link CartoKitDotDensityLayer} to use
 * for the starting dot value.
 * @returns The starting dot value.
 */
export function deriveDotDensityStartingValue(
  features: GeoJSON.Feature[],
  attribute: string
): number {
  const [min, max] = d3.extent(features, (d) => d.properties?.[attribute] ?? 0);

  // Aim for a ratio where the number of dots is 10% of the range.
  return (max - min) * 0.1 || 1;
}
