import { redraw } from '$lib/core/recon/layer-type/redraw';
import { map } from '$lib/state/map.svelte';
import type { CartoKitLineLayer, LayerType } from '$lib/types';

/**
 * Reconcile a {@link CartoKitLayer} to a {@link CartoKitLineLayer}.
 *
 * @param sourceLayerId The id of the source layer.
 * @param sourceLayerType The type of the source layer.
 * @param targetLayer The definition of the target {@link CartoKitLineLayer}.
 */
export function reconLine(
  sourceLayerId: string,
  sourceLayerType: LayerType,
  targetLayer: CartoKitLineLayer
): void {
  switch (sourceLayerType) {
    case 'Choropleth':
    case 'Dot Density':
    case 'Heatmap':
    case 'Polygon':
    case 'Line':
      break;
    case 'Point':
    case 'Proportional Symbol':
      redraw({
        map: map.value!,
        sourceLayerId,
        sourceLayerType,
        targetLayer
      });
      break;
  }
}
