import type { CartoKitLayer, CartoKitLineLayer } from '$lib/types';

/**
 * Patch a {@link CartoKitLayer} to a {@link CartoKitLineLayer}.
 *
 * @param layer The {@link CartoKitLayer} to patch.
 * @returns The patched {@link CartoKitLineLayer}.
 */
export function patchLine(layer: CartoKitLayer): CartoKitLineLayer {
  switch (layer.type) {
    case 'Choropleth':
    case 'Dot Density':
    case 'Heatmap':
    case 'Polygon':
      throw new Error(
        `Unsupported geometry transition. Transition initiated from ${layer.type} to Line.`
      );
    case 'Line':
      return layer;
    case 'Point':
    case 'Proportional Symbol': {
      const targetLayer: CartoKitLineLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Line',
        data: {
          url: layer.data.url,
          fileName: layer.data.fileName,
          geojson: layer.data.sourceGeojson,
          sourceGeojson: layer.data.sourceGeojson,
          transformations: layer.data.transformations
        },
        style: {
          stroke: layer.style.stroke
        },
        layout: layer.layout
      };

      return targetLayer;
    }
  }
}
