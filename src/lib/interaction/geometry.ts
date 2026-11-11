import type { ExpressionSpecification } from 'maplibre-gl';

import { catalog } from '$lib/state/catalog.svelte';
import type { ProportionalSymbolStyle } from '$lib/types';
import type { QuantitativeAttributeEntry } from '$lib/types/catalog';
import { signedSqrt } from '$lib/utils/number';

/**
 * Derive a MapLibre GL JS expression for a proportional symbol radius scale.
 *
 * @param layerId The id of the layer to derive a radius scale for.
 * @param style The {@link ProportionalSymbolStyle} to derive a radius scale for.
 * @returns An {@link ExpressionSpecification} for a proportional symbol radius scale.
 */
export function deriveSize(
  layerId: string,
  style: ProportionalSymbolStyle
): ExpressionSpecification {
  const { min, max } = catalog.value[layerId].attributes[
    style.attribute
  ] as QuantitativeAttributeEntry;
  const [rMin, rMax] = [style.min, style.max];
  const attribute = style.attribute;

  // If the full range of the attribute is positive, we can take the square root
  // directly; otherwise, ensure we preserve the sign to linear scales on ranges
  // with negative values.
  const attrExpression: ExpressionSpecification =
    min >= 0 && max >= max
      ? ['sqrt', ['get', attribute]]
      : [
          '*',
          ['case', ['<', ['get', attribute], 0], -1, 1],
          ['sqrt', ['abs', ['get', attribute]]]
        ];

  return [
    'interpolate',
    ['linear'],
    attrExpression,
    signedSqrt(min),
    rMin,
    signedSqrt(max),
    rMax
  ];
}
