import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

/**
 * Get the layer ids for all instrumented layers associated with a given layer.
 *
 * @param layer — the CartoKit layer that the instrumented layers are associated with.
 *
 * @returns – an array of instrumented layer ids.
 */
export function getInstrumetedLayerIds(layer: CartoKitLayer): string[] {
  if (layer.type === 'Dot Density') {
    return [
      `${layer.id}-outlines`,
      `${layer.id}-outlines-hover`,
      `${layer.id}-outlines-select`
    ];
  }

  return [`${layer.id}-hover`, `${layer.id}-select`];
}
