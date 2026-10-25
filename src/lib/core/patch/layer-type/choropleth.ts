import { catalog } from '$lib/state/catalog.svelte';
import type { CartoKitChoroplethLayer, CartoKitLayer } from '$lib/types';
import type { QuantitativeAttributeEntry } from '$lib/types/catalog';
import { selectQuantitativeAttribute } from '$lib/utils/attributes';
import {
  DEFAULT_COUNT,
  DEFAULT_METHOD,
  DEFAULT_QUANTITATIVE_SCHEME,
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
      const scaleType = DEFAULT_METHOD(layer.source.type);

      const targetLayer: CartoKitChoroplethLayer = {
        ...layer,
        type: 'Choropleth',
        source,
        style: {
          fill: {
            type: 'Quantitative',
            attribute: layer.style.dot.attribute,
            scale: {
              type: scaleType,
              scheme: {
                id: DEFAULT_QUANTITATIVE_SCHEME,
                direction: DEFAULT_SCHEME_DIRECTION
              },
              steps: DEFAULT_COUNT,
              thresholds: (
                catalog.value[layer.id].attributes[
                  layer.style.dot.attribute
                ] as QuantitativeAttributeEntry
              )[scaleType][DEFAULT_COUNT].breaks
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
      const attribute =
        layer.type === 'Proportional Symbol'
          ? layer.style.size.attribute
          : selectQuantitativeAttribute(layer.id);
      const scaleType = DEFAULT_METHOD(layer.source.type);

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
                    type: scaleType,
                    scheme: {
                      id: DEFAULT_QUANTITATIVE_SCHEME,
                      direction: DEFAULT_SCHEME_DIRECTION
                    },
                    steps: DEFAULT_COUNT,
                    thresholds: (
                      catalog.value[layer.id].attributes[
                        attribute
                      ] as QuantitativeAttributeEntry
                    )[scaleType][DEFAULT_COUNT].breaks
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
      const attribute = selectQuantitativeAttribute(layer.id);
      const scaleType = DEFAULT_METHOD(layer.source.type);

      const targetLayer: CartoKitChoroplethLayer = {
        ...layer,
        type: 'Choropleth',
        style: {
          ...layer.style,
          fill: {
            type: 'Quantitative',
            attribute,
            scale: {
              type: scaleType,
              scheme: {
                id: DEFAULT_QUANTITATIVE_SCHEME,
                direction: DEFAULT_SCHEME_DIRECTION
              },
              steps: DEFAULT_COUNT,
              thresholds: (
                catalog.value[layer.id].attributes[
                  attribute
                ] as QuantitativeAttributeEntry
              )[scaleType][DEFAULT_COUNT].breaks
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
