import { redraw } from '$lib/core/recon/layer-type/redraw';
import { map } from '$lib/state/map.svelte';
import type { CartoKitLayer, CartoKitLineLayer } from '$lib/types';

/**
 * Reconcile a {@link CartoKitLayer} to a {@link CartoKitLineLayer}.
 *
 * @param {CartoKitLayer} sourceLayer The {@link CartoKitLayer} to reconcile.
 * @param {CartoKitLineLayer} targetLayer The {@link CartoKitLineLayer} to reconcile to.
 */
export function reconLine(
  sourceLayer: CartoKitLayer,
  targetLayer: CartoKitLineLayer
): void {
  switch (sourceLayer.type) {
    case 'Choropleth':
    case 'Heatmap':
    case 'Polygon':
      throw new Error(
        `Unsupported geometry transition. Transition initiated from ${sourceLayer.type} to Line.`
      );
    case 'Line':
      break;
    case 'Point':
    case 'Proportional Symbol':
      redraw(map.value!, sourceLayer, targetLayer);
      break;
  }
}
