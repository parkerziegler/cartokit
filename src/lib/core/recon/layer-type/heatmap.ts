import { map } from '#lib/state/map.svelte.ts';
import type { CartoKitHeatmapLayer, LayerType } from '#lib/types/index.ts';
import { redraw } from '#lib/utils/layer/redraw.ts';

/**
 * Reconcile a {@link CartoKitLayer} to a {@link CartoKitHeatmapLayer}.
 *
 * @param sourceLayerId The id of the source layer.
 * @param sourceLayerType The type of the source layer.
 * @param targetLayer The definition of the target {@link CartoKitHeatmapLayer}.
 */
export function reconHeatmap(
  sourceLayerId: string,
  sourceLayerType: Extract<LayerType, 'Point' | 'Proportional Symbol'>,
  targetLayer: CartoKitHeatmapLayer
): void {
  switch (sourceLayerType) {
    case 'Point':
    case 'Proportional Symbol':
      redraw(map.value!, sourceLayerId, targetLayer);
      break;
  }
}
