import { redraw } from '$lib/core/recon/layer-type/redraw';
import { map } from '$lib/state/map.svelte';
import type { CartoKitLayer, CartoKitPolygonLayer } from '$lib/types';

/**
 * Reconcile a {@link CartoKitLayer} to a {@link CartoKitPolygonLayer}.
 *
 * @param {CartoKitLayer} sourceLayer The {@link CartoKitLayer} to reconcile.
 * @param {CartoKitPolygonLayer} targetLayer The {@link CartoKitPolygonLayer} to reconcile to.
 */
export function reconPolygon(
  sourceLayer: CartoKitLayer,
  targetLayer: CartoKitPolygonLayer
): void {
  switch (sourceLayer.type) {
    case 'Polygon':
      break;
    case 'Choropleth': {
      // Update the fill-color of the existing layer. All other paint properties
      // should remain unchanged.
      map.value?.setPaintProperty(
        sourceLayer.id,
        'fill-color',
        targetLayer.style.fill!.color
      );
      break;
    }
    case 'Point':
    case 'Proportional Symbol':
      redraw(map.value!, sourceLayer, targetLayer);
      break;
    case 'Heatmap':
    case 'Line':
      throw new Error(
        `Unsupported geometry transition. Transition initiated from ${sourceLayer.type} to Polygon.`
      );
  }
}
