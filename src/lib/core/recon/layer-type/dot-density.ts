import { redraw } from '$lib/core/recon/layer-type/redraw';
import { map } from '$lib/state/map.svelte';
import type { CartoKitDotDensityLayer, CartoKitLayer } from '$lib/types';

/**
 * Reconcile a {@link CartoKitLayer} to a {@link CartoKitDotDensityLayer}.
 *
 * @param sourceLayer The {@link CartoKitLayer} to reconcile.
 * @param targetLayer The definition of the target {@link CartoKitDotDensityLayer}.
 */
export function reconDotDensity(
  sourceLayer: CartoKitLayer,
  targetLayer: CartoKitDotDensityLayer
): void {
  switch (sourceLayer.type) {
    case 'Choropleth':
    case 'Polygon':
    case 'Point':
    case 'Proportional Symbol':
      redraw(map.value!, sourceLayer, targetLayer);
      break;
    case 'Dot Density':
    case 'Heatmap':
    case 'Line':
      break;
  }
}
