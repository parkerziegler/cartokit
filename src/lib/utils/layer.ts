import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

/**
 * Get the layer ids for all instrumented layers associated with a given layer.
 *
 * @param layer — the CartoKit layer that the instrumented layers are associated with.
 *
 * @returns – an array of instrumented layer ids.
 */
export const getInstrumentedLayerIds = (layer: CartoKitLayer): string[] => {
  switch (layer.type) {
    case 'Point':
    case 'Proportional Symbol':
    case 'Line':
      return [`${layer.id}-hover`, `${layer.id}-select`];
    case 'Dot Density':
      return [
        `${layer.id}-outlines`,
        `${layer.id}-outlines-hover`,
        `${layer.id}-outlines-select`
      ];
    case 'Fill':
    case 'Choropleth':
      return [`${layer.id}-stroke`, `${layer.id}-hover`, `${layer.id}-select`];
  }
};
