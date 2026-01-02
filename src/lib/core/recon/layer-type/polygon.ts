import { redraw } from '$lib/core/recon/layer-type/redraw';
import { map } from '$lib/state/map.svelte';
import type { CartoKitLayer, CartoKitPolygonLayer } from '$lib/types';

/**
 * Reconcile a {@link CartoKitLayer} to a {@link CartoKitPolygonLayer}.
 *
 * @param sourceLayer The {@link CartoKitLayer} to reconcile.
 * @param targetLayer The definition of the target {@link CartoKitPolygonLayer}.
 */
export function reconPolygon(
  sourceLayer: CartoKitLayer,
  targetLayer: CartoKitPolygonLayer
): void {
  switch (sourceLayer.type) {
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
    case 'Dot Density':
    case 'Point':
    case 'Proportional Symbol':
      redraw(map.value!, sourceLayer, targetLayer);
      break;
    case 'Heatmap':
    case 'Line':
    case 'Polygon':
      break;
  }
}
