import { redraw } from '$lib/core/recon/layer-type/redraw';
import { map } from '$lib/state/map.svelte';
import type { CartoKitDotDensityLayer, LayerType } from '$lib/types';

/**
 * Reconcile a {@link CartoKitLayer} to a {@link CartoKitDotDensityLayer}.
 *
 * @param sourceLayerId The id of the source layer.
 * @param sourceLayerType The type of the source layer.
 * @param targetLayer The definition of the target {@link CartoKitDotDensityLayer}.
 */
export function reconDotDensity(
  sourceLayerId: string,
  sourceLayerType: LayerType,
  targetLayer: CartoKitDotDensityLayer
): void {
  switch (sourceLayerType) {
    case 'Choropleth':
    case 'Polygon':
    case 'Point':
    case 'Proportional Symbol':
      redraw({
        map: map.value!,
        sourceLayerId,
        sourceLayerType,
        targetLayer
      });
      break;
    case 'Dot Density':
    case 'Heatmap':
    case 'Line':
      break;
  }
}
