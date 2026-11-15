import { deriveSize } from '#lib/interaction/geometry.ts';
import { map } from '#lib/state/map.svelte.ts';
import type {
  CartoKitProportionalSymbolLayer,
  LayerType
} from '#lib/types/index.ts';
import { redraw } from '#lib/utils/layer/redraw.ts';

/**
 * Reconcile a {@link CartoKitLayer} to a {@link CartoKitProportionalSymbolLayer}.
 *
 * @param sourceLayerId The id of the source layer.
 * @param sourceLayerType The type of the source layer.
 * @param targetLayer The definition of the target {@link CartoKitProportionalSymbolLayer}.
 */
export function reconProportionalSymbol(
  sourceLayerId: string,
  sourceLayerType: Extract<LayerType, 'Heatmap' | 'Point'>,
  targetLayer: CartoKitProportionalSymbolLayer
): void {
  switch (sourceLayerType) {
    case 'Heatmap':
      redraw(map.value!, sourceLayerId, targetLayer);
      break;
    case 'Point':
      // Update the circle-radius of the existing layer. All other paint
      // properties should remain unchanged.
      map.value?.setPaintProperty(
        targetLayer.id,
        'circle-radius',
        deriveSize(targetLayer.id, targetLayer.style.size)
      );
      break;
  }
}
