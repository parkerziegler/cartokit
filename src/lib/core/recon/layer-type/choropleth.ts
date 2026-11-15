import { deriveColorScale } from '#lib/interaction/color.ts';
import { map } from '#lib/state/map.svelte.ts';
import type { CartoKitChoroplethLayer, LayerType } from '#lib/types/index.ts';

/**
 * Reconcile a {@link CartoKitLayer} to a {@link CartoKitChoroplethLayer}.
 *
 * @param sourceLayerId The id of the source layer.
 * @param sourceLayerType The type of the source layer.
 * @param targetLayer The definition of the target {@link CartoKitChoroplethLayer}.
 */
export function reconChoropleth(
  _sourceLayerId: string,
  sourceLayerType: Extract<LayerType, 'Polygon'>,
  targetLayer: CartoKitChoroplethLayer
): void {
  switch (sourceLayerType) {
    case 'Polygon':
      // Set the fill-color of polygons based on the choropleth color scale.
      map.value?.setPaintProperty(
        targetLayer.id,
        'fill-color',
        deriveColorScale(targetLayer.style.fill, targetLayer.id)
      );
  }
}
