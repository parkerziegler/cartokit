import { deriveRadius } from '$lib/interaction/geometry';
import { redraw } from '$lib/core/recon/layer-type/redraw';
import { map } from '$lib/state/map.svelte';
import type {
  CartoKitLayer,
  CartoKitProportionalSymbolLayer
} from '$lib/types';

/**
 * Reconcile a {@link CartoKitLayer} to a
 * {@link CartoKitProportionalSymbolLayer}.
 *
 * This function mirrors the redraw and MapLibre side‑effects previously handled
 * by {@link transitionToProportionalSymbol}.
 *
 * @param {CartoKitLayer} sourceLayer The {@link CartoKitLayer} to reconcile.
 * @param {CartoKitProportionalSymbolLayer} targetLayer The
 * {@link CartoKitProportionalSymbolLayer} to reconcile to.
 */
export function reconProportionalSymbol(
  sourceLayer: CartoKitLayer,
  targetLayer: CartoKitProportionalSymbolLayer
): void {
  switch (sourceLayer.type) {
    case 'Choropleth':
    case 'Heatmap':
    case 'Line':
    case 'Polygon':
      redraw(map.value!, sourceLayer, targetLayer);
      break;
    case 'Point':
      // Update the circle-radius of the existing layer. All other paint
      // properties should remain unchanged.
      map.value?.setPaintProperty(
        targetLayer.id,
        'circle-radius',
        deriveRadius(targetLayer)
      );
      break;
    case 'Proportional Symbol':
      break;
  }
}
