import type { CartoKitLayer, CartoKitPolygonLayer } from '$lib/types';
import { randomColor } from '$lib/utils/color';

/**
 * Patch a {@link CartoKitLayer} to a {@link CartoKitPolygonLayer}.
 *
 * @param layer The {@link CartoKitLayer} to patch.
 * @returns The patched {@link CartoKitPolygonLayer}.
 */
export function patchPolygon(layer: CartoKitLayer): CartoKitPolygonLayer {
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
    case 'Dot Density': {
      const source =
        layer.source.type === 'geojson'
          ? {
              ...layer.source,
              data: layer.source.sourceData,
              // Remove the dot density transformation.
              transformations: layer.source.transformations.filter(
                (transformation) =>
                  transformation.name !== 'generateDotDensityPoints'
              )
            }
          : layer.source;

      const targetLayer: CartoKitPolygonLayer = {
        ...layer,
        type: 'Polygon',
        source
      };

      return targetLayer;
    }
    case 'Heatmap':
    case 'Line':
      throw new Error(
        `Unsupported geometry transition. Transition initiated from ${layer.type} to Polygon.`
      );
    case 'Point':
    case 'Proportional Symbol': {
      const source =
        layer.source.type === 'geojson'
          ? {
              ...layer.source,
              data: layer.source.sourceData,
              // Remove the centroid transformation.
              transformations: layer.source.transformations.filter(
                (transformation) => transformation.name !== 'deriveCentroids'
              )
            }
          : layer.source;

      const targetLayer: CartoKitPolygonLayer = {
        ...layer,
        type: 'Polygon',
        source,
        style: {
          fill:
            layer.style.fill.type === 'Constant'
              ? layer.style.fill
              : {
                  type: 'Constant',
                  color: randomColor(),
                  opacity: layer.style.fill.opacity,
                  visible: layer.style.fill.visible
                },
          stroke: layer.style.stroke
        }
      };

      return targetLayer;
    }
    case 'Polygon':
      return layer;
  }
}
