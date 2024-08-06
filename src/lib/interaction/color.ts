import type { ExpressionSpecification } from 'maplibre-gl';

import type { CartoKitChoroplethLayer } from '$lib/types';
import { DEFAULT_FILL } from '$lib/utils/constants';

/**
 * Derive a MapLibre GL JS expression for a choropleth color scale.
 *
 * @param layer – The @see{CartoKitChoroplethLayer} to derive a color scale for.
 *
 * @returns A MapLibre GL JS expression for a choropleth color scale.
 */
export function deriveColorScale(
  layer: CartoKitChoroplethLayer
): ExpressionSpecification {
  switch (layer.style.fill.type) {
    case 'Quantitative': {
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
        (acc, color, i) =>
          i === 0 ? acc : acc.concat([thresholds[i - 1], color]),
        []
      );

      return [...prelude, ...stops];
    }
    case 'Categorical': {
      const {
        style: {
          fill: { categories, scheme }
        }
      } = layer;

      let stops: string[] = [];

      if (scheme.length < categories.length) {
        stops = scheme.reduce<string[]>(
          (acc, scheme, i) => [...acc, categories[i], scheme],
          []
        );
      } else {
        stops = categories.reduce<string[]>(
          (acc, category, i) => [...acc, category, scheme[i]],
          []
        );
      }

      return [
        'match',
        ['get', layer.style.fill.attribute],
        stops[0],
        stops[1],
        ...stops.slice(2),
        DEFAULT_FILL
      ];
    }
  }
}
