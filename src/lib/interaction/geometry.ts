import type { ExpressionSpecification } from 'maplibre-gl';

import { catalog } from '$lib/state/catalog.svelte';
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
  const { min, max } = catalog.value[layer.id][layer.style.size.attribute];
  const [rMin, rMax] = [layer.style.size.min, layer.style.size.max];

  return [
    'interpolate',
    ['linear'],
    ['sqrt', ['get', layer.style.size.attribute]],
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
 * @param layerId The ID of the {@link CartoKitDotDensityLayer}.
 * @param attribute The attribute of the {@link CartoKitDotDensityLayer} to use
 * for the starting dot value.
 * @returns The starting dot value.
 */
export function deriveDotDensityStartingValue(
  layerId: string,
  attribute: string
): number {
  const { min, max } = catalog.value[layerId][attribute];

  // Aim for a ratio where the number of dots is 10% of the range.
  return (max - min) * 0.1 || 1;
}
