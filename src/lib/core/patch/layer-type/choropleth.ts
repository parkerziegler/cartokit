import type { CartoKitLayer, CartoKitChoroplethLayer } from '$lib/types';
import { selectQuantitativeAttribute } from '$lib/utils/geojson';
import {
  DEFAULT_METHOD,
  DEFAULT_QUANTITATIVE_SCHEME,
  DEFAULT_COUNT,
  DEFAULT_THRESHOLDS,
  DEFAULT_SCHEME_DIRECTION
} from '$lib/utils/constants';

/**
 * Patch (transform) a {@link CartoKitLayer} to a {@link CartoKitChoroplethLayer}.
 *
 * @param {CartoKitLayer} layer The {@link CartoKitLayer} to patch (transform).
 * @returns {CartoKitChoroplethLayer} The transformed {@link CartoKitChoroplethLayer}.
 */
export function patchChoropleth(layer: CartoKitLayer): CartoKitChoroplethLayer {
  switch (layer.type) {
    case 'Choropleth':
      return layer;
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
            layer.style.fill.type === 'Quantitative'
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
                  opacity: layer.style.fill.opacity,
                  visible: layer.style.fill.visible
                },
          stroke: layer.style.stroke
        },
        layout: layer.layout
      };

      return targetLayer;
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
            opacity: layer.style.fill.opacity,
            visible: layer.style.fill.visible
          },
          stroke: layer.style.stroke
        },
        layout: layer.layout
      };

      return targetLayer;
    }
  }
}
