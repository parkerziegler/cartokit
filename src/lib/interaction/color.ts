import type { ExpressionSpecification } from 'maplibre-gl';

import type { CartoKitChoroplethLayer } from '$lib/types';

/**
 * Derive a MapLibre GL JS expression for a choropleth color scale.
 *
 * @param layer – The CartoKit layer to derive a color scale for.
 *
 * @returns A MapLibre GL JS expression for a choropleth color scale.
 */
export function deriveColorScale(
  layer: CartoKitChoroplethLayer
): ExpressionSpecification {
  const {
    style: {
      fill: { scheme, count, thresholds }
    }
  } = layer;

  const colors = scheme[count] as string[];

  const prelude: ExpressionSpecification = [
    'step',
    ['get', layer.style.fill.attribute],
    colors[0]
  ];
  const stops = colors.reduce<(string | number)[]>(
    (acc, color, i) => (i === 0 ? acc : acc.concat([thresholds[i - 1], color])),
    []
  );

  return [...prelude, ...stops];
}
