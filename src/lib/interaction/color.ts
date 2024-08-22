import type { ExpressionSpecification } from 'maplibre-gl';

import type {
  ConstantStyle,
  CategoricalStyle,
  QuantitativeStyle
} from '$lib/types';
import { DEFAULT_FILL } from '$lib/utils/constants';

/**
 * Derive a MapLibre GL JS expression for a choropleth color scale.
 *
 * @param {ConstantStyle | CategoricalStyle | QuantitativeStyle} style – The
 * style from which to derive the color scale.
 * @returns {ExpressionSpecification | string} — A MapLibre GL JS expression for
 * a color scale.
 */
export function deriveColorScale(
  style: ConstantStyle | CategoricalStyle | QuantitativeStyle
): ExpressionSpecification | string {
  switch (style.type) {
    case 'Quantitative': {
      const { scheme, count, attribute, thresholds } = style;

      const colors = scheme[count] as string[];

      const prelude: ExpressionSpecification = [
        'step',
        ['get', attribute],
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
      const { categories, scheme, attribute } = style;

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
        ['get', attribute],
        stops[0],
        stops[1],
        ...stops.slice(2),
        DEFAULT_FILL
      ];
    }
    case 'Constant':
      return style.color;
  }
}
