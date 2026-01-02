import { redraw } from '$lib/core/recon/layer-type/redraw';
import { map } from '$lib/state/map.svelte';
import type { CartoKitLayer, CartoKitPointLayer } from '$lib/types';
import { DEFAULT_SIZE } from '$lib/utils/constants';

/**
 * Reconcile a {@link CartoKitLayer} to a {@link CartoKitPointLayer}.
 *
 * @param sourceLayer The {@link CartoKitLayer} to reconcile.
 * @param targetLayer The definition of the target {@link CartoKitPointLayer}.
 */
export function reconPoint(
  sourceLayer: CartoKitLayer,
  targetLayer: CartoKitPointLayer
): void {
  switch (sourceLayer.type) {
    case 'Choropleth':
    case 'Dot Density':
    case 'Heatmap':
    case 'Line':
    case 'Polygon':
      redraw(map.value!, sourceLayer, targetLayer);
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
