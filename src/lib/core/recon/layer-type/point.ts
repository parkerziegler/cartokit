import { redraw } from '$lib/core/recon/layer-type/redraw';
import { map } from '$lib/state/map.svelte';
import type { CartoKitLayer, CartoKitPointLayer } from '$lib/types';
import { DEFAULT_RADIUS } from '$lib/utils/constants';

/**
 * Reconcile a {@link CartoKitLayer} to a {@link CartoKitPointLayer}.
 *
 * @param {CartoKitLayer} sourceLayer The {@link CartoKitLayer} to reconcile.
 * @param {CartoKitPointLayer} targetLayer The {@link CartoKitPointLayer} to reconcile to.
 */
export function reconPoint(
  sourceLayer: CartoKitLayer,
  targetLayer: CartoKitPointLayer
): void {
  switch (sourceLayer.type) {
    case 'Point':
      break;
    case 'Choropleth':
    case 'Heatmap':
    case 'Line':
    case 'Polygon':
      redraw(map.value!, sourceLayer, targetLayer);
      break;
    case 'Proportional Symbol':
      // Update the circle-radius of the existing layer. All other paint
      // properties should remain unchanged.
      map.value?.setPaintProperty(
        targetLayer.id,
        'circle-radius',
        DEFAULT_RADIUS
      );
      break;
  }
}
