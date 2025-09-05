import type { Map } from 'maplibre-gl';

import type { CartoKitLayer, CartoKitChoroplethLayer } from '$lib/types';
import { selectQuantitativeAttribute } from '$lib/utils/geojson';
import { deriveColorScale } from '$lib/interaction/color';
import {
  DEFAULT_METHOD,
  DEFAULT_QUANTITATIVE_SCHEME,
  DEFAULT_COUNT,
  DEFAULT_THRESHOLDS,
  DEFAULT_OPACITY,
  DEFAULT_SCHEME_DIRECTION
} from '$lib/utils/constants';

/**
 * Transition a @see{CartoKitLayer} to a @see{CartoKitChoroplethLayer}.
 *
 * @param {Map} map — The top-level MapLibre GL map instance.
 * @param {CartoKitLayer} layer — The @see{CartoKitLayer} to transition.
 * @returns {Object} — The transitioned @see{CartoKitChoroplethLayer} and a
 * Boolean flag indicating whether the layer needs to be redrawn.
 */
export function transitionToChoropleth(
  map: Map,
  layer: CartoKitLayer
): {
  targetLayer: CartoKitChoroplethLayer;
  redraw: boolean;
} {
  switch (layer.type) {
    case 'Choropleth': {
      return {
        targetLayer: layer,
        redraw: false
      };
    }
    case 'Dot Density': {
      // Remove the dot density transformation.
      const transformations = layer.data.transformations.filter(
        (transformation) => transformation.name !== 'generateDotDensityPoints'
      );

      const targetLayer: CartoKitChoroplethLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Choropleth',
        data: {
          url: layer.data.url,
          fileName: layer.data.fileName,
          geojson: layer.data.sourceGeojson,
          sourceGeojson: layer.data.sourceGeojson,
          transformations
        },
        style: {
          fill: {
            type: 'Quantitative',
            attribute: layer.style.dots.attribute,
            method: DEFAULT_METHOD,
            scheme: {
              id: DEFAULT_QUANTITATIVE_SCHEME,
              direction: DEFAULT_SCHEME_DIRECTION
            },
            count: DEFAULT_COUNT,
            thresholds: DEFAULT_THRESHOLDS(
              layer.id,
              layer.style.dots.attribute
            ),
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
    case 'Heatmap':
      throw new Error(
        'Unsupported geometry transition. Transition initiated from Heatmap to Choropleth.'
      );
    case 'Line':
      throw new Error(
        'Unsupported geometry transition. Transition initiated from Line to Choropleth.'
      );
    case 'Point':
    case 'Proportional Symbol': {
      // Remove the centroid transformation.
      const transformations = layer.data.transformations.filter(
        (transformation) => transformation.name !== 'deriveCentroids'
      );

      // Select a quantitative attribute for the visualization.
      const attribute = selectQuantitativeAttribute(
        layer.data.geojson.features
      );

      const targetLayer: CartoKitChoroplethLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Choropleth',
        data: {
          url: layer.data.url,
          fileName: layer.data.fileName,
          geojson: layer.data.sourceGeojson,
          sourceGeojson: layer.data.sourceGeojson,
          transformations
        },
        style: {
          fill:
            layer.style.fill?.type === 'Quantitative'
              ? layer.style.fill
              : {
                  type: 'Quantitative',
                  attribute,
                  method: DEFAULT_METHOD,
                  scheme: {
                    id: DEFAULT_QUANTITATIVE_SCHEME,
                    direction: DEFAULT_SCHEME_DIRECTION
                  },
                  count: DEFAULT_COUNT,
                  thresholds: DEFAULT_THRESHOLDS(layer.id, attribute),
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
    case 'Polygon': {
      const attribute = selectQuantitativeAttribute(
        layer.data.geojson.features
      );

      const targetLayer: CartoKitChoroplethLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Choropleth',
        data: layer.data,
        style: {
          fill: {
            type: 'Quantitative',
            attribute,
            method: DEFAULT_METHOD,
            scheme: {
              id: DEFAULT_QUANTITATIVE_SCHEME,
              direction: 'Forward'
            },
            count: DEFAULT_COUNT,
            thresholds: DEFAULT_THRESHOLDS(layer.id, attribute),
            opacity: layer.style.fill?.opacity ?? DEFAULT_OPACITY
          },
          stroke: layer.style.stroke
        },
        layout: layer.layout
      };

      // Set the fill-color of polygons based on the choropleth color scale.
      map.setPaintProperty(
        layer.id,
        'fill-color',
        deriveColorScale(targetLayer.style.fill)
      );

      // If the Polygon layer we're transitioning from had no fill, set the opacity
      // to the default to ensure the fill is visible.
      if (!layer.style.fill?.opacity) {
        map.setPaintProperty(layer.id, 'fill-opacity', DEFAULT_OPACITY);
      }

      return {
        targetLayer,
        redraw: false
      };
    }
  }
}
