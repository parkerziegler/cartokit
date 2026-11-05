import type { CartoKitChoroplethLayer, CartoKitPolygonLayer } from '$lib/types';
import { randomColor } from '$lib/utils/color';

/**
 * Patch a {@link CartoKitChoroplethLayer} to a {@link CartoKitPolygonLayer}.
 *
 * @param layer The {@link CartoKitChoroplethLayer} to patch.
 * @returns The patched {@link CartoKitPolygonLayer}.
 */
export function patchPolygon(
  layer: CartoKitChoroplethLayer
): CartoKitPolygonLayer {
  switch (layer.type) {
    case 'Choropleth': {
      const targetLayer: CartoKitPolygonLayer = {
        ...layer,
        type: 'Polygon',
        style: {
          ...layer.style,
          fill: {
            type: 'Constant',
            color: randomColor(),
            opacity: layer.style.fill.opacity,
            visible: layer.style.fill.visible
          }
        }
      };

      return targetLayer;
    }
  }
}
