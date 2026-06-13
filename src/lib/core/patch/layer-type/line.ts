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
      const source =
        layer.source.type === 'geojson'
          ? {
              ...layer.source,
              // Remove the centroid transformation.
              transformations: layer.source.transformations.filter(
                (transformation) => transformation.name !== 'deriveCentroids'
              )
            }
          : layer.source;

      const targetLayer: CartoKitLineLayer = {
        ...layer,
        type: 'Line',
        source,
        style: {
          stroke: layer.style.stroke
        }
      };

      return targetLayer;
    }
  }
}
