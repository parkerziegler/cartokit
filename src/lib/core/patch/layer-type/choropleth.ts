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

      const targetLayer: CartoKitChoroplethLayer = {
        ...layer,
        type: 'Choropleth',
        source,
        style: {
          fill: {
            type: 'Quantitative',
            attribute: layer.style.dot.attribute,
            scale: {
              type: DEFAULT_METHOD,
              scheme: {
                id: DEFAULT_QUANTITATIVE_SCHEME,
                direction: DEFAULT_SCHEME_DIRECTION
              },
              steps: DEFAULT_COUNT,
              thresholds: DEFAULT_THRESHOLDS(
                layer.id,
                layer.style.dot.attribute
              )
            },
            opacity: layer.style.fill.opacity,
            visible: layer.style.fill.visible
          },
          stroke: layer.style.stroke
        }
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
      const { source, attribute } =
        layer.source.type === 'geojson'
          ? {
              source: {
                ...layer.source,
                data: layer.source.sourceData,
                // Remove the centroid transformation.
                transformations: layer.source.transformations.filter(
                  (transformation) => transformation.name !== 'deriveCentroids'
                )
              },
              attribute:
                layer.type === 'Proportional Symbol'
                  ? layer.style.size.attribute
                  : selectQuantitativeAttribute(layer.source.data.features)
            }
          : {
              source: layer.source,
              attribute:
                layer.type === 'Proportional Symbol'
                  ? layer.style.size.attribute
                  : '' // TODO: Discern if and how to select a quantitative attribute for vector tile layers.
            };

      const targetLayer: CartoKitChoroplethLayer = {
        ...layer,
        type: 'Choropleth',
        source,
        style: {
          fill:
            layer.style.fill.type === 'Quantitative'
              ? layer.style.fill
              : {
                  type: 'Quantitative',
                  attribute,
                  scale: {
                    type: DEFAULT_METHOD,
                    scheme: {
                      id: DEFAULT_QUANTITATIVE_SCHEME,
                      direction: DEFAULT_SCHEME_DIRECTION
                    },
                    steps: DEFAULT_COUNT,
                    thresholds: DEFAULT_THRESHOLDS(layer.id, attribute)
                  },
                  opacity: layer.style.fill.opacity,
                  visible: layer.style.fill.visible
                },
          stroke: layer.style.stroke
        }
      };

      return targetLayer;
    }
    case 'Polygon': {
      const attribute =
        layer.source.type === 'geojson'
          ? selectQuantitativeAttribute(layer.source.data.features)
          : ''; // TODO: Discern if and how to select a quantitative attribute for vector tile layers.

      const targetLayer: CartoKitChoroplethLayer = {
        ...layer,
        type: 'Choropleth',
        style: {
          ...layer.style,
          fill: {
            type: 'Quantitative',
            attribute,
            scale: {
              type: DEFAULT_METHOD,
              scheme: {
                id: DEFAULT_QUANTITATIVE_SCHEME,
                direction: DEFAULT_SCHEME_DIRECTION
              },
              steps: DEFAULT_COUNT,
              thresholds: DEFAULT_THRESHOLDS(layer.id, attribute)
            },
            opacity: layer.style.fill.opacity,
            visible: layer.style.fill.visible
          }
        }
      };

      return targetLayer;
    }
  }
}
