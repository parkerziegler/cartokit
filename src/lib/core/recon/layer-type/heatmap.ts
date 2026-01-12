import { redraw } from '$lib/core/recon/layer-type/redraw';
import { map } from '$lib/state/map.svelte';
import type { CartoKitHeatmapLayer, LayerType } from '$lib/types';

/**
 * Reconcile a {@link CartoKitLayer} to a {@link CartoKitHeatmapLayer}.
 *
 * @param sourceLayerId The id of the source layer.
 * @param sourceLayerType The type of the source layer.
 * @param targetLayer The definition of the target {@link CartoKitHeatmapLayer}.
 */
export function reconHeatmap(
  sourceLayerId: string,
  sourceLayerType: LayerType,
  targetLayer: CartoKitHeatmapLayer
): void {
  switch (sourceLayerType) {
    case 'Choropleth':
    case 'Dot Density':
    case 'Line':
    case 'Polygon':
    case 'Heatmap':
      break;
    case 'Point':
    case 'Proportional Symbol':
      redraw({
        map: map.value!,
        sourceLayerId,
        sourceLayerType,
        targetLayer
      });
      break;
  }
}
