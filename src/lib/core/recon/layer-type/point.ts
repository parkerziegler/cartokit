import { map } from '#lib/state/map.svelte.ts';
import type { CartoKitPointLayer, LayerType } from '#lib/types/index.ts';
import { DEFAULT_SIZE } from '#lib/utils/constants.ts';
import { redraw } from '#lib/utils/layer/redraw.ts';

/**
 * Reconcile a {@link CartoKitLayer} to a {@link CartoKitPointLayer}.
 *
 * @param sourceLayerId The id of the source layer.
 * @param sourceLayerType The type of the source layer.
 * @param targetLayer The definition of the target {@link CartoKitPointLayer}.
 */
export function reconPoint(
  sourceLayerId: string,
  sourceLayerType: Extract<LayerType, 'Heatmap' | 'Proportional Symbol'>,
  targetLayer: CartoKitPointLayer
): void {
  switch (sourceLayerType) {
    case 'Heatmap':
      redraw(map.value!, sourceLayerId, targetLayer);
      break;
    case 'Proportional Symbol':
      // Update the circle-radius of the existing layer. All other paint
      // properties should remain unchanged.
      map.value?.setPaintProperty(
        targetLayer.id,
        'circle-radius',
        DEFAULT_SIZE
      );
      break;
  }
}
