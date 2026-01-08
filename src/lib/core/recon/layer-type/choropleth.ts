import { redraw } from '$lib/core/recon/layer-type/redraw';
import { deriveColorScale } from '$lib/interaction/color';
import { map } from '$lib/state/map.svelte';
import type { CartoKitChoroplethLayer, CartoKitLayer } from '$lib/types';

/**
 * Reconcile a {@link CartoKitLayer} to a {@link CartoKitChoroplethLayer}.
 *
 * @param sourceLayer The {@link CartoKitLayer} to reconcile.
 * @param targetLayer The definition of the target {@link CartoKitChoroplethLayer}.
 */
export function reconChoropleth(
  sourceLayer: CartoKitLayer,
  targetLayer: CartoKitChoroplethLayer
): void {
  switch (sourceLayer.type) {
    case 'Choropleth':
    case 'Heatmap':
    case 'Line':
      break;
    case 'Dot Density':
    case 'Point':
    case 'Proportional Symbol':
      redraw(map.value!, sourceLayer, targetLayer);
      break;
    case 'Polygon':
      // Set the fill-color of polygons based on the choropleth color scale.
      map.value?.setPaintProperty(
        targetLayer.id,
        'fill-color',
        deriveColorScale(targetLayer.style.fill)
      );
  }
}
