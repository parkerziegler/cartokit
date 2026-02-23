import * as d3 from 'd3';
import { zip } from 'lodash-es';
import type { ExpressionSpecification } from 'maplibre-gl';

import type {
  ConstantStyle,
  CategoricalStyle,
  DiscreteQuantitativeStyle,
  ContinuousQuantitativeStyle,
  HeatmapStyle
} from '$lib/types';
import { DEFAULT_FILL } from '$lib/utils/constants';
import { materializeColorRamp } from '$lib/utils/color/ramp';
import { materializeColorScheme } from '$lib/utils/color/scheme';
import { materializeColorInterpolator } from '$lib/utils/color/interpolator';
import { catalog } from '$lib/state/catalog.svelte';

/**
 * Derive a MapLibre GL JS expression for a choropleth color scale.
 *
 * @param {ConstantStyle | CategoricalStyle | DiscreteQuantitativeStyle | ContinuousQuantitativeStyle} style – The
 * style from which to derive the color scale.
 * @param {string} [layerId] – The layer ID (required for continuous quantitative styles).
 * @returns {ExpressionSpecification | string} — A MapLibre GL JS expression for
 * a color scale.
 */
export function deriveColorScale(
  style: ConstantStyle | CategoricalStyle | DiscreteQuantitativeStyle | ContinuousQuantitativeStyle,
  layerId?: string
): ExpressionSpecification | string {
  switch (style.type) {
    case 'DiscreteQuantitative': {
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
    case 'ContinuousQuantitative': {
      const { interpolator, attribute } = style;
      const NUM_STEPS = 10;

      const { min, max } = catalog.value[layerId][attribute];
      const colorInterpolator = materializeColorInterpolator(
        interpolator.id,
        interpolator.direction
      );

      // Sample the interpolator at regular intervals
      const prelude: ExpressionSpecification = [
        'interpolate',
        ['linear'],
        ['get', attribute],
        min
      ];

      // Add color stops at regular intervals across the data range
      for (let i = 0; i <= NUM_STEPS; i++) {
        const t = i / NUM_STEPS;
        const value = min + (max - min) * t;
        const color = colorInterpolator(t);
        prelude.push(value);
        prelude.push(color);
      }

      return prelude;
    }
    case 'Categorical': {
      const { categories, scheme, attribute } = style;

      const colors = materializeColorScheme(
        scheme.id,
        scheme.direction,
        categories.length
      );

      const stops = zip(categories, colors)
        .filter(
          (pair): pair is [string, string] | [number, string] =>
            pair[0] !== undefined && pair[1] !== undefined
        )
        .flat();

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

  const colors = materializeColorRamp(ramp.id, ramp.direction, 10);

  const start = d3.color(colors[0]);
  start!.opacity = 0;

  return [
    'interpolate',
    ['linear'],
    ['heatmap-density'],
    0,
    start!.formatRgb(),
    ...colors
      .slice(1)
      // Prevent floating point precision issues.
      .flatMap((color, i) => [parseFloat((0.1 * (i + 1)).toFixed(1)), color])
  ];
}
