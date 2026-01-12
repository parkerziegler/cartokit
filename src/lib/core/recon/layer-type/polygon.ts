import { redraw } from '$lib/core/recon/layer-type/redraw';
import { map } from '$lib/state/map.svelte';
import type { CartoKitPolygonLayer, LayerType } from '$lib/types';

/**
 * Reconcile a {@link CartoKitLayer} to a {@link CartoKitPolygonLayer}.
 *
 * @param sourceLayerId The id of the source layer.
 * @param sourceLayerType The type of the source layer.
 * @param targetLayer The definition of the target {@link CartoKitPolygonLayer}.
 */
export function reconPolygon(
  sourceLayerId: string,
  sourceLayerType: LayerType,
  targetLayer: CartoKitPolygonLayer
): void {
  switch (sourceLayerType) {
    case 'Choropleth': {
      // Update the fill-color of the existing layer. All other paint properties
      // should remain unchanged.
      map.value?.setPaintProperty(
        sourceLayerId,
        'fill-color',
        targetLayer.style.fill!.color
      );
      break;
    }
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
    case 'Heatmap':
    case 'Line':
    case 'Polygon':
      break;
  }
}
