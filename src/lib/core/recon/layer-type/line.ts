import { redraw } from '$lib/core/recon/layer-type/redraw';
import { map } from '$lib/state/map.svelte';
import type { CartoKitLayer, CartoKitLineLayer } from '$lib/types';

/**
 * Reconcile a {@link CartoKitLayer} to a {@link CartoKitLineLayer}.
 *
 * @param sourceLayer The {@link CartoKitLayer} to reconcile.
 * @param targetLayer The definition of the target {@link CartoKitLineLayer}.
 */
export function reconLine(
  sourceLayer: CartoKitLayer,
  targetLayer: CartoKitLineLayer
): void {
  switch (sourceLayer.type) {
    case 'Choropleth':
    case 'Dot Density':
    case 'Heatmap':
    case 'Polygon':
    case 'Line':
      break;
    case 'Point':
    case 'Proportional Symbol':
      redraw(map.value!, sourceLayer, targetLayer);
      break;
  }
}
