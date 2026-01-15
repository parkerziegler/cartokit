import { redraw } from '$lib/core/recon/layer-type/redraw';
import { map } from '$lib/state/map.svelte';
import type { CartoKitPointLayer, LayerType } from '$lib/types';
import { DEFAULT_SIZE } from '$lib/utils/constants';

/**
 * Reconcile a {@link CartoKitLayer} to a {@link CartoKitPointLayer}.
 *
 * @param sourceLayerId The id of the source layer.
 * @param sourceLayerType The type of the source layer.
 * @param targetLayer The definition of the target {@link CartoKitPointLayer}.
 */
export function reconPoint(
  sourceLayerId: string,
  sourceLayerType: LayerType,
  targetLayer: CartoKitPointLayer
): void {
  switch (sourceLayerType) {
    case 'Choropleth':
    case 'Dot Density':
    case 'Heatmap':
    case 'Line':
    case 'Polygon':
      redraw({
        map: map.value!,
        sourceLayerId,
        sourceLayerType,
        targetLayer
      });
      break;
    case 'Point':
      break;
    case 'Proportional Symbol':
      // Update the circle-radius of the existing layer. All other paint
      // properties should remain unchanged.
      map.value?.setPaintProperty(
        targetLayer.id,
        'circle-radius',
        DEFAULT_SIZE
      );
      break;
  }
}
