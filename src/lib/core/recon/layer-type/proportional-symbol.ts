import { deriveSize } from '$lib/interaction/geometry';
import { redraw } from '$lib/core/recon/layer-type/redraw';
import { map } from '$lib/state/map.svelte';
import type { CartoKitProportionalSymbolLayer, LayerType } from '$lib/types';

/**
 * Reconcile a {@link CartoKitLayer} to a {@link CartoKitProportionalSymbolLayer}.
 *
 * @param sourceLayerId The id of the source layer.
 * @param sourceLayerType The type of the source layer.
 * @param targetLayer The definition of the target {@link CartoKitProportionalSymbolLayer}.
 */
export function reconProportionalSymbol(
  sourceLayerId: string,
  sourceLayerType: LayerType,
  targetLayer: CartoKitProportionalSymbolLayer
): void {
  switch (sourceLayerType) {
    case 'Choropleth':
    case 'Dot Density':
    case 'Heatmap':
    case 'Line':
    case 'Polygon':
      redraw({
        map: map.value!,
        sourceLayerId,
        sourceLayerType,
        targetLayer
      });
      break;
    case 'Point':
      // Update the circle-radius of the existing layer. All other paint
      // properties should remain unchanged.
      map.value?.setPaintProperty(
        targetLayer.id,
        'circle-radius',
        deriveSize(targetLayer)
      );
      break;
    case 'Proportional Symbol':
      break;
  }
}
