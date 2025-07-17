import * as d3 from 'd3';
import type { ExpressionSpecification } from 'maplibre-gl';

import type {
  ConstantStyle,
  CategoricalStyle,
  QuantitativeStyle,
  HeatmapStyle
} from '$lib/types';
import { DEFAULT_FILL } from '$lib/utils/constants';
import { materializeColorRamp } from '$lib/utils/ramp';
import { materializeColorScheme } from '$lib/utils/scheme';

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

      const colors = materializeColorScheme(scheme.id, scheme.direction, count);

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

      const colors = materializeColorScheme(
        scheme.id,
        scheme.direction,
        categories.length
      );

      const stops = colors.reduce<(string | number)[]>(
        (acc, color, i) =>
          i === 0 ? acc : acc.concat([categories[i - 1], color]),
        []
      );

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

/**
 * Derive a MapLibre GL JS expression for a color ramp.
 *
 * @param {HeatmapStyle} style – The style from which to derive the color ramp.
 * @returns {ExpressionSpecification} — A MapLibre GL JS expression for a color
 * ramp.
 */
export function deriveColorRamp(style: HeatmapStyle): ExpressionSpecification {
  const { ramp } = style;

  const colors = materializeColorRamp(ramp.id, ramp.direction, 11);

  const start = d3.color(colors[0]);
  start!.opacity = 0;

  return [
    'interpolate',
    ['linear'],
    ['heatmap-density'],
    0,
    start!.formatRgb(),
    0.1,
    colors[1],
    0.2,
    colors[2],
    0.3,
    colors[3],
    0.4,
    colors[4],
    0.5,
    colors[5],
    0.6,
    colors[6],
    0.7,
    colors[7],
    0.8,
    colors[8],
    0.9,
    colors[9],
    1,
    colors[10]
  ];
}
