import type { CartoKitLayer, CartoKitPolygonLayer } from '$lib/types';
import { randomColor } from '$lib/utils/color';

/**
 * Patch (transform) a {@link CartoKitLayer} to a {@link CartoKitPolygonLayer}.
 *
 * @param {CartoKitLayer} layer The {@link CartoKitLayer} to patch (transform).
 * @returns {CartoKitPolygonLayer} The transformed {@link CartoKitPolygonLayer}.
 */
export function patchPolygon(layer: CartoKitLayer): CartoKitPolygonLayer {
  switch (layer.type) {
    case 'Choropleth': {
      const color = randomColor();

      const targetLayer: CartoKitPolygonLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Polygon',
        data: layer.data,
        style: {
          fill: {
            type: 'Constant',
            color,
            opacity: layer.style.fill.opacity,
            visible: layer.style.fill.visible
          },
          stroke: layer.style.stroke
        },
        layout: layer.layout
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
      // Remove the centroid transformation.
      const transformations = layer.data.transformations.filter(
        (transformation) => transformation.name !== 'deriveCentroids'
      );

      const targetLayer: CartoKitPolygonLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Polygon',
        data: {
          url: layer.data.url,
          fileName: layer.data.fileName,
          geojson: layer.data.sourceGeojson,
          sourceGeojson: layer.data.sourceGeojson,
          transformations
        },
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
        },
        layout: layer.layout
      };

      return targetLayer;
    }
    case 'Polygon':
      return layer;
  }
}
