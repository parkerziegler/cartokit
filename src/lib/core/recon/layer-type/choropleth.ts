import { redraw } from '$lib/core/recon/layer-type/redraw';
import { deriveColorScale } from '$lib/interaction/color';
import { map } from '$lib/state/map.svelte';
import type { CartoKitChoroplethLayer, CartoKitLayer } from '$lib/types';
import { DEFAULT_OPACITY } from '$lib/utils/constants';

/**
 * Reconcile a {@link CartoKitLayer} to a {@link CartoKitChoroplethLayer}.
 *
 * @param {CartoKitLayer} sourceLayer The {@link CartoKitLayer} to reconcile.
 * @param {CartoKitChoroplethLayer} targetLayer The {@link CartoKitChoroplethLayer} to reconcile to.
 */
export function reconChoropleth(
  sourceLayer: CartoKitLayer,
  targetLayer: CartoKitChoroplethLayer
): void {
  switch (sourceLayer.type) {
    case 'Choropleth':
      break;
    case 'Point':
    case 'Proportional Symbol':
      redraw(map.value!, sourceLayer, targetLayer);
      break;
    case 'Heatmap':
    case 'Line':
      throw new Error(
        `Unsupported geometry transition. Transition initiated from ${sourceLayer.type} to Choropleth.`
      );
    case 'Polygon':
      // Set the fill-color of polygons based on the choropleth color scale.
      map.value?.setPaintProperty(
        targetLayer.id,
        'fill-color',
        deriveColorScale(targetLayer.style.fill)
      );

      // If the Polygon layer we're transitioning from had no fill, set the opacity
      // to the default to ensure the fill is visible.
      if (!sourceLayer.style.fill.opacity) {
        map.value?.setPaintProperty(
          targetLayer.id,
          'fill-opacity',
          DEFAULT_OPACITY
        );
      }
      break;
  }
}
