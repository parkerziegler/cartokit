import type { ExpressionSpecification } from 'maplibre-gl';

import {
  deriveEqualIntervals,
  deriveJenksBreaks,
  deriveQuantiles
} from '$lib/interaction/scales';
import type { CartoKitChoroplethLayer } from '$lib/types/CartoKitLayer';

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
    attribute,
    data: {
      geoJSON: { features }
    },
    style: {
      breaks: { scale, scheme, count }
    }
  } = layer;

  const colors = scheme[count].slice();

  const prelude: ExpressionSpecification = [
    'step',
    ['get', layer.attribute],
    colors[0]
  ];
  let stops: (string | number)[] = [];

  switch (scale) {
    case 'Quantile':
      stops = buildStops(
        colors,
        deriveQuantiles({ attribute, features, range: colors })
      );
      break;
    case 'Equal Interval':
      stops = buildStops(
        colors,
        deriveEqualIntervals({ attribute, features, range: colors })
      );
      break;
    case 'Jenks':
      stops = buildStops(
        colors,
        deriveJenksBreaks({ attribute, features, range: colors })
      );
      break;
  }

  return [...prelude, ...stops];
}

/**
 * Construct the stops portion of a MapLibre GL JS step expression.
 *
 * @param colors – The colors to use in the expression.
 * @param stops – The stops (breaks) to use in the expression.
 *
 * @returns – The stops portion of a MapLibre GL JS step expression.
 */
function buildStops(colors: string[], stops: number[]): (string | number)[] {
  return colors.reduce<(string | number)[]>(
    (acc, color, i) => (i === 0 ? acc : acc.concat([stops[i - 1], color])),
    []
  );
}
