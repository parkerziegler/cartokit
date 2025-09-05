import type { Map } from 'maplibre-gl';

import type { CartoKitLayer, CartoKitPolygonLayer } from '$lib/types';
import { randomColor } from '$lib/utils/color';
import { DEFAULT_OPACITY } from '$lib/utils/constants';

/**
 * Transition a @see{CartoKitLayer} to a @see{CartoKitPolygonLayer}.
 *
 * @param {Map} map — The top-level MapLibre GL map instance.
 * @param {CartoKitLayer} layer — The @see{CartoKitLayer} to transition.
 * @returns {Object} — The transitioned @see{CartoKitPolygonLayer} and a
 * Boolean flag indicating whether the layer needs to be redrawn.
 */
export function transitionToPolygon(
  map: Map,
  layer: CartoKitLayer
): {
  targetLayer: CartoKitPolygonLayer;
  redraw: boolean;
} {
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
            opacity: layer.style.fill.opacity
          },
          stroke: layer.style.stroke
        },
        layout: layer.layout
      };

      // Update the fill-color of the existing layer. All other paint properties
      // should remain unchanged.
      map.setPaintProperty(layer.id, 'fill-color', color);

      return {
        targetLayer,
        redraw: false
      };
    }
    case 'Dot Density': {
      // Remove the dot density transformation.
      const transformations = layer.data.transformations.filter(
        (transformation) => transformation.name !== 'generateDotDensityPoints'
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
          fill: layer.style.fill,
          stroke: layer.style.stroke
        },
        layout: layer.layout
      };

      return {
        targetLayer,
        redraw: true
      };
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
            layer.style.fill?.type === 'Constant'
              ? layer.style.fill
              : {
                  type: 'Constant',
                  color: randomColor(),
                  opacity: layer.style.fill?.opacity ?? DEFAULT_OPACITY
                },
          stroke: layer.style.stroke
        },
        layout: layer.layout
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Polygon':
      return {
        targetLayer: layer,
        redraw: false
      };
  }
}
