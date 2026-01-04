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
 * Patch a {@link CartoKitLayer} to a {@link CartoKitChoroplethLayer}.
 *
 * @param layer The {@link CartoKitLayer} to patch.
 * @returns The patched {@link CartoKitChoroplethLayer}.
 */
export function patchChoropleth(layer: CartoKitLayer): CartoKitChoroplethLayer {
  switch (layer.type) {
    case 'Choropleth':
      return layer;
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
        `Unsupported geometry transition. Transition initiated from ${layer.type} to Choropleth.`
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
