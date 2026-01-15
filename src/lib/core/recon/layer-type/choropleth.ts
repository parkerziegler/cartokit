import { redraw } from '$lib/core/recon/layer-type/redraw';
import { deriveColorScale } from '$lib/interaction/color';
import { map } from '$lib/state/map.svelte';
import type { CartoKitChoroplethLayer, LayerType } from '$lib/types';

/**
 * Reconcile a {@link CartoKitLayer} to a {@link CartoKitChoroplethLayer}.
 *
 * @param sourceLayerId The id of the source layer.
 * @param sourceLayerType The type of the source layer.
 * @param targetLayer The definition of the target {@link CartoKitChoroplethLayer}.
 */
export function reconChoropleth(
  sourceLayerId: string,
  sourceLayerType: LayerType,
  targetLayer: CartoKitChoroplethLayer
): void {
  switch (sourceLayerType) {
    case 'Choropleth':
    case 'Heatmap':
    case 'Line':
      break;
    case 'Dot Density':
    case 'Point':
    case 'Proportional Symbol':
      redraw({
        map: map.value!,
        sourceLayerId,
        sourceLayerType,
        targetLayer
      });
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
