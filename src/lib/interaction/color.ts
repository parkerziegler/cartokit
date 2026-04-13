import * as d3 from 'd3';
import { zip } from 'lodash-es';
import type { ExpressionSpecification } from 'maplibre-gl';

import type {
  ConstantStyle,
  CategoricalStyle,
  QuantitativeStyle,
  HeatmapStyle
} from '$lib/types';
import { DEFAULT_FILL } from '$lib/utils/constants';
import { materializeColorRamp } from '$lib/utils/color/ramp';
import { materializeColorScheme } from '$lib/utils/color/scheme';
import { catalog } from '$lib/state/catalog.svelte';

/**
 * Derive a MapLibre GL JS expression for a choropleth color scale.
 *
 * @param style The {@link ConstantStyle}, {@link CategoricalStyle}, or
 * {@link QuantitativeStyle} from which to derive the color scale.
 * @returns An {@link ExpressionSpecification} or string for a color scale.
 */
export function deriveColorScale(
  style: ConstantStyle | CategoricalStyle | QuantitativeStyle,
  layerId?: string
): ExpressionSpecification | string {
  switch (style.type) {
    case 'Quantitative': {
      const { scale, attribute } = style;

      if (scale.type === 'Continuous') {
        const { min, max } = catalog.value[layerId!][attribute];
        const colors = materializeColorRamp(
          scale.interpolator.id,
          scale.interpolator.direction,
          10
        );
        const step = (max - min) / 10;

        return [
          'interpolate',
          ['linear'],
          ['get', attribute],
          ...colors.flatMap((color, i) => [
            parseFloat((min + i * step).toFixed(10)),
            color
          ])
        ];
      } else {
        const colors = materializeColorScheme(
          scale.scheme.id,
          scale.scheme.direction,
          scale.steps
        );

        const prelude: ExpressionSpecification = [
          'step',
          ['get', attribute],
          colors[0]
        ];
        const stops = colors.reduce<(string | number)[]>(
          (acc, color, i) =>
            i === 0 ? acc : acc.concat([scale.thresholds[i - 1], color]),
          []
        );

        return [...prelude, ...stops];
      }
    }
    case 'Categorical': {
      const { scale, attribute } = style;

      const colors = materializeColorScheme(
        scale.scheme.id,
        scale.scheme.direction,
        scale.categories.length
      );

      const stops = zip(scale.categories, colors)
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
 * @param style The style from which to derive the color ramp.
 * @returns An {@link ExpressionSpecification} for a color ramp.
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
