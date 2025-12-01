import { redraw } from '$lib/core/recon/layer-type/redraw';
import { map } from '$lib/state/map.svelte';
import type { CartoKitHeatmapLayer, CartoKitLayer } from '$lib/types';

/**
 * Reconcile a {@link CartoKitLayer} to a {@link CartoKitHeatmapLayer}.
 *
 * @param {CartoKitLayer} sourceLayer The {@link CartoKitLayer} to reconcile.
 * @param {CartoKitHeatmapLayer} targetLayer The {@link CartoKitHeatmapLayer} to reconcile to.
 */
export function reconHeatmap(
  sourceLayer: CartoKitLayer,
  targetLayer: CartoKitHeatmapLayer
): void {
  switch (sourceLayer.type) {
    case 'Choropleth':
    case 'Line':
    case 'Polygon':
      throw new Error(
        `Unsupported geometry transition. Transition initiated from ${sourceLayer.type} to Heatmap.`
      );
    case 'Heatmap':
      break;
    case 'Point':
    case 'Proportional Symbol':
      redraw(map.value!, sourceLayer, targetLayer);
      break;
  }
}
