import type { ExpressionSpecification } from 'maplibre-gl';

import { catalog } from '$lib/state/catalog.svelte';
import type { NumericCatalogEntry, ProportionalSymbolStyle } from '$lib/types';
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
  const { min, max } = catalog.value[layerId][
    style.attribute
  ] as NumericCatalogEntry;
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

/**
 * Obtain a starting dot value for a {@link CartoKitDotDensityLayer} based on
 * the maximum value of the data attribute.
 *
 * @param layerId The ID of the {@link CartoKitDotDensityLayer}.
 * @param attribute The attribute of the {@link CartoKitDotDensityLayer} to use
 * for the starting dot value.
 * @returns The starting dot value.
 */
export function deriveDotDensityStartingValue(
  layerId: string,
  attribute: string
): number {
  const { min, max } = catalog.value[layerId][attribute] as NumericCatalogEntry;

  // Aim for a ratio where the number of dots is 10% of the range.
  return (max - min) * 0.1 || 1;
}
