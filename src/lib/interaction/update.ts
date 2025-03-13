import type { FeatureCollection } from 'geojson';
import type { GeoJSONSource } from 'maplibre-gl';
import { get } from 'svelte/store';

import { updateLayerChannel } from '$lib/interaction/channel';
import { transitionLayerType } from '$lib/interaction/layer-type';
import { ir } from '$lib/stores/ir';
import { map as mapStore } from '$lib/stores/map';
import type {
  CartoKitLayer,
  CartoKitPointLayer,
  CartoKitProportionalSymbolLayer,
  CartoKitDotDensityLayer,
  CartoKitPolygonLayer,
  CartoKitChoroplethLayer,
  ClassificationMethod,
  QuantitativeColorScheme,
  LayerType,
  Transformation,
  VisualizationType,
  QuantitativeFill,
  CategoricalFill,
  CategoricalColorScheme,
  ConstantFill,
  Channel
} from '$lib/types';
import {
  DEFAULT_FILL,
  DEFAULT_OPACITY,
  DEFAULT_QUANTITATIVE_SCHEME,
  DEFAULT_STROKE,
  DEFAULT_STROKE_OPACITY,
  DEFAULT_STROKE_WIDTH,
  DEFAULT_CATEGORICAL_SCHEME,
  DEFAULT_COUNT,
  DEFAULT_THRESHOLDS
} from '$lib/utils/constants';
import {
  enumerateAttributeCategories,
  selectCategoricalAttribute,
  selectQuantitativeAttribute
} from '$lib/utils/geojson';

interface LayerUpdate {
  layerId: CartoKitLayer['id'];
}

interface LayerTypeUpdate extends LayerUpdate {
  type: 'layer-type';
  payload: {
    layerType: LayerType;
  };
}

interface AttributeUpdate extends LayerUpdate {
  type: 'attribute';
  payload: {
    attribute: string;
    channel: Channel;
  };
}

interface FillUpdate extends LayerUpdate {
  type: 'fill';
  payload: {
    color: string;
  };
}

interface FillOpacityUpdate extends LayerUpdate {
  type: 'fill-opacity';
  payload: {
    opacity: number;
  };
}

interface AddFillUpdate extends LayerUpdate {
  type: 'add-fill';
  payload: Record<string, never>;
}

interface RemoveFillUpdate extends LayerUpdate {
  type: 'remove-fill';
  payload: Record<string, never>;
}

interface StrokeUpdate extends LayerUpdate {
  type: 'stroke';
  payload: {
    color: string;
  };
}

interface StrokeWidthUpdate extends LayerUpdate {
  type: 'stroke-width';
  payload: {
    strokeWidth: number;
  };
}

interface StrokeOpacityUpdate extends LayerUpdate {
  type: 'stroke-opacity';
  payload: {
    opacity: number;
  };
}

interface AddStrokeUpdate extends LayerUpdate {
  type: 'add-stroke';
  payload: Record<string, never>;
}

interface RemoveStrokeUpdate extends LayerUpdate {
  type: 'remove-stroke';
  payload: Record<string, never>;
}

interface PointSizeUpdate extends LayerUpdate {
  type: 'point-size';
  payload: {
    size: number;
  };
}

interface ClassificationMethodUpdate extends LayerUpdate {
  type: 'classification-method';
  payload: {
    method: ClassificationMethod;
  };
}

interface ColorSchemeUpdate extends LayerUpdate {
  type: 'color-scheme';
  payload: {
    scheme: QuantitativeColorScheme | CategoricalColorScheme;
  };
}

interface ColorCountUpdate extends LayerUpdate {
  type: 'color-count';
  payload: {
    count: number;
  };
}

interface ColorThresholdUpdate extends LayerUpdate {
  type: 'color-threshold';
  payload: {
    index: number;
    threshold: number;
  };
}

interface SizeUpdate extends LayerUpdate {
  type: 'size';
  payload: {
    min?: number;
    max?: number;
  };
}

interface DotValueUpdate extends LayerUpdate {
  type: 'dot-value';
  payload: {
    value: number;
  };
}

interface TransformationUpdate extends LayerUpdate {
  type: 'transformation';
  payload: {
    geojson: FeatureCollection;
    transformation: Transformation;
  };
}

interface FillVisualizationUpdate extends LayerUpdate {
  type: 'visualization-type';
  payload: {
    visualizationType: VisualizationType;
  };
}

type DispatchLayerUpdateParams =
  | LayerTypeUpdate
  | AttributeUpdate
  | FillUpdate
  | FillOpacityUpdate
  | AddFillUpdate
  | RemoveFillUpdate
  | StrokeUpdate
  | StrokeWidthUpdate
  | StrokeOpacityUpdate
  | AddStrokeUpdate
  | RemoveStrokeUpdate
  | PointSizeUpdate
  | ClassificationMethodUpdate
  | ColorSchemeUpdate
  | ColorCountUpdate
  | ColorThresholdUpdate
  | SizeUpdate
  | DotValueUpdate
  | TransformationUpdate
  | FillVisualizationUpdate;

/**
 * Dispatch standardized updates to specific layers.
 *
 * @param params – Required parameters for the layer update.
 * @param type – The type of update to dispatch.
 * @param layerId – The id of the @see{CartoKitLayer} to update.
 * @param payload – The payload for the update.
 */
export function dispatchLayerUpdate({
  type,
  layerId,
  payload
}: DispatchLayerUpdateParams): void {
  const map = get(mapStore);
  if (
    type !== 'classification-method' ||
    (type === 'classification-method' &&
      'method' in payload &&
      payload.method !== 'Manual')
  ) {
    performance.mark('reconciliation-start');
  }

  switch (type) {
    case 'layer-type': {
      ir.update((ir) => {
        const layer = ir.layers[layerId];

        ir.layers[layer.id] = transitionLayerType(
          map,
          layer,
          payload.layerType
        );

        return ir;
      });
      break;
    }
    case 'attribute': {
      ir.update((ir) => {
        const lyr = ir.layers[layerId] as
          | CartoKitPointLayer
          | CartoKitProportionalSymbolLayer
          | CartoKitDotDensityLayer
          | CartoKitChoroplethLayer;

        // @ts-expect-error – payload.channel may not be defined on all layers;
        // for example, the size channel is only defined on a
        // CartoKitProportionalSymbolLayer. However, the UI only renders the
        // component that dispatches this update for valid channels on a given
        // layer type.
        lyr.style[payload.channel].attribute = payload.attribute;

        updateLayerChannel(map, lyr, payload.channel);

        return ir;
      });
      break;
    }
    case 'fill': {
      ir.update((ir) => {
        const lyr = ir.layers[layerId] as
          | CartoKitPointLayer
          | CartoKitProportionalSymbolLayer
          | CartoKitDotDensityLayer
          | CartoKitPolygonLayer;

        if (lyr.style.fill?.type === 'Constant') {
          lyr.style.fill.color = payload.color;

          switch (lyr.type) {
            case 'Point':
            case 'Proportional Symbol':
            case 'Dot Density':
              map.setPaintProperty(layerId, 'circle-color', payload.color);
              break;
            case 'Polygon':
              map.setPaintProperty(layerId, 'fill-color', payload.color);
              break;
          }
        }

        return ir;
      });
      break;
    }
    case 'fill-opacity': {
      ir.update((ir) => {
        const lyr = ir.layers[layerId] as
          | CartoKitPointLayer
          | CartoKitProportionalSymbolLayer
          | CartoKitDotDensityLayer
          | CartoKitPolygonLayer
          | CartoKitChoroplethLayer;

        if (lyr.style.fill) {
          lyr.style.fill.opacity = payload.opacity;

          switch (lyr.type) {
            case 'Point':
            case 'Proportional Symbol':
            case 'Dot Density':
              map.setPaintProperty(layerId, 'circle-opacity', payload.opacity);
              break;
            case 'Polygon':
            case 'Choropleth':
              map.setPaintProperty(layerId, 'fill-opacity', payload.opacity);
              break;
          }
        }

        return ir;
      });
      break;
    }
    case 'add-fill': {
      ir.update((ir) => {
        const lyr = ir.layers[layerId] as
          | CartoKitPointLayer
          | CartoKitProportionalSymbolLayer
          | CartoKitDotDensityLayer
          | CartoKitPolygonLayer;
        lyr.style.fill = {
          type: 'Constant',
          color: DEFAULT_FILL,
          opacity: DEFAULT_OPACITY
        };

        switch (lyr.type) {
          case 'Point':
          case 'Proportional Symbol':
          case 'Dot Density':
            map.setPaintProperty(layerId, 'circle-color', DEFAULT_FILL);
            map.setPaintProperty(layerId, 'circle-opacity', DEFAULT_OPACITY);
            break;
          case 'Polygon':
            map.setPaintProperty(layerId, 'fill-color', DEFAULT_FILL);
            map.setPaintProperty(layerId, 'fill-opacity', DEFAULT_OPACITY);
            break;
        }

        return ir;
      });
      break;
    }
    case 'remove-fill': {
      ir.update((ir) => {
        const lyr = ir.layers[layerId] as
          | CartoKitPointLayer
          | CartoKitProportionalSymbolLayer
          | CartoKitDotDensityLayer
          | CartoKitPolygonLayer;
        lyr.style.fill = undefined;

        switch (lyr.type) {
          case 'Point':
          case 'Proportional Symbol':
          case 'Dot Density':
            map.setPaintProperty(layerId, 'circle-color', 'transparent');
            map.setPaintProperty(layerId, 'circle-opacity', 0);
            break;
          case 'Polygon':
            map.setPaintProperty(layerId, 'fill-color', 'transparent');
            map.setPaintProperty(layerId, 'fill-opacity', 0);
            break;
        }

        return ir;
      });
      break;
    }
    case 'stroke': {
      ir.update((ir) => {
        const lyr = ir.layers[layerId];
        if (lyr.style.stroke) {
          lyr.style.stroke.color = payload.color;

          switch (lyr.type) {
            case 'Point':
            case 'Proportional Symbol':
            case 'Dot Density':
              map.setPaintProperty(
                layerId,
                'circle-stroke-color',
                payload.color
              );
              break;
            case 'Line':
              map.setPaintProperty(layerId, 'line-color', payload.color);
              break;
            case 'Polygon':
            case 'Choropleth':
              map.setPaintProperty(
                `${layerId}-stroke`,
                'line-color',
                payload.color
              );
              break;
          }
        }

        return ir;
      });
      break;
    }
    case 'stroke-width': {
      ir.update((ir) => {
        const lyr = ir.layers[layerId];

        if (lyr.style.stroke) {
          lyr.style.stroke.width = payload.strokeWidth;

          switch (lyr.type) {
            case 'Point':
            case 'Proportional Symbol':
            case 'Dot Density':
              map.setPaintProperty(
                layerId,
                'circle-stroke-width',
                payload.strokeWidth
              );
              break;
            case 'Line':
              map.setPaintProperty(layerId, 'line-width', payload.strokeWidth);
              break;
            case 'Polygon':
            case 'Choropleth':
              map.setPaintProperty(
                `${layerId}-stroke`,
                'line-width',
                payload.strokeWidth
              );
              break;
          }
        }

        return ir;
      });
      break;
    }
    case 'stroke-opacity': {
      ir.update((ir) => {
        const lyr = ir.layers[layerId];

        if (lyr.style.stroke) {
          lyr.style.stroke.opacity = payload.opacity;

          switch (lyr.type) {
            case 'Point':
            case 'Proportional Symbol':
            case 'Dot Density':
              map.setPaintProperty(
                layerId,
                'circle-stroke-opacity',
                payload.opacity
              );
              break;
            case 'Line':
              map.setPaintProperty(layerId, 'line-opacity', payload.opacity);
              break;
            case 'Polygon':
            case 'Choropleth':
              map.setPaintProperty(
                `${layerId}-stroke`,
                'line-opacity',
                payload.opacity
              );
              break;
          }
        }

        return ir;
      });
      break;
    }
    case 'add-stroke': {
      ir.update((ir) => {
        const lyr = ir.layers[layerId] as
          | CartoKitPointLayer
          | CartoKitProportionalSymbolLayer
          | CartoKitDotDensityLayer
          | CartoKitPolygonLayer
          | CartoKitChoroplethLayer;
        // Create a default stroke.
        lyr.style.stroke = {
          type: 'Constant',
          color: DEFAULT_STROKE,
          width: DEFAULT_STROKE_WIDTH,
          opacity: DEFAULT_STROKE_OPACITY
        };

        switch (lyr.type) {
          case 'Point':
          case 'Proportional Symbol':
          case 'Dot Density':
            map.setPaintProperty(
              layerId,
              'circle-stroke-color',
              DEFAULT_STROKE
            );
            map.setPaintProperty(
              layerId,
              'circle-stroke-width',
              DEFAULT_STROKE_WIDTH
            );
            map.setPaintProperty(
              layerId,
              'circle-stroke-opacity',
              DEFAULT_STROKE_OPACITY
            );
            break;
          case 'Polygon':
          case 'Choropleth':
            map.setPaintProperty(
              `${layerId}-stroke`,
              'line-color',
              DEFAULT_STROKE
            );
            map.setPaintProperty(
              `${layerId}-stroke`,
              'line-width',
              DEFAULT_STROKE_WIDTH
            );
            map.setPaintProperty(
              `${layerId}-stroke`,
              'line-opacity',
              DEFAULT_STROKE_OPACITY
            );
            break;
        }

        return ir;
      });
      break;
    }
    case 'remove-stroke': {
      ir.update((ir) => {
        const lyr = ir.layers[layerId] as
          | CartoKitPointLayer
          | CartoKitProportionalSymbolLayer
          | CartoKitDotDensityLayer
          | CartoKitPolygonLayer
          | CartoKitChoroplethLayer;
        lyr.style.stroke = undefined;

        switch (lyr.type) {
          case 'Point':
          case 'Proportional Symbol':
          case 'Dot Density':
            map.setPaintProperty(layerId, 'circle-stroke-color', 'transparent');
            map.setPaintProperty(layerId, 'circle-stroke-width', 0);
            map.setPaintProperty(layerId, 'circle-stroke-opacity', 0);
            break;
          case 'Polygon':
          case 'Choropleth':
            map.setPaintProperty(
              `${layerId}-stroke`,
              'line-color',
              'transparent'
            );
            map.setPaintProperty(`${layerId}-stroke`, 'line-width', 0);
            map.setPaintProperty(`${layerId}-stroke`, 'line-opacity', 0);
            break;
        }

        return ir;
      });
      break;
    }
    case 'point-size': {
      ir.update((ir) => {
        const lyr = ir.layers[layerId] as
          | CartoKitPointLayer
          | CartoKitDotDensityLayer;
        lyr.type === 'Point'
          ? (lyr.style.size = payload.size)
          : (lyr.style.dots.size = payload.size);

        map.setPaintProperty(layerId, 'circle-radius', payload.size);

        return ir;
      });
      break;
    }
    case 'classification-method': {
      ir.update((ir) => {
        const lyr = ir.layers[layerId] as
          | CartoKitPointLayer
          | CartoKitChoroplethLayer
          | CartoKitProportionalSymbolLayer;

        switch (lyr.style.fill?.type) {
          case 'Quantitative':
            lyr.style.fill.method = payload.method;

            updateLayerChannel(map, lyr, 'fill');
            break;
          default:
            break;
        }

        return ir;
      });
      break;
    }
    case 'color-scheme': {
      ir.update((ir) => {
        const lyr = ir.layers[layerId] as
          | CartoKitPointLayer
          | CartoKitChoroplethLayer
          | CartoKitProportionalSymbolLayer;

        switch (lyr.style.fill?.type) {
          case 'Quantitative':
          case 'Categorical':
            lyr.style.fill.scheme = payload.scheme;

            updateLayerChannel(map, lyr, 'fill');
            break;
          default:
            break;
        }

        return ir;
      });
      break;
    }
    case 'color-count': {
      ir.update((ir) => {
        const lyr = ir.layers[layerId] as
          | CartoKitPointLayer
          | CartoKitChoroplethLayer
          | CartoKitProportionalSymbolLayer;

        switch (lyr.style.fill?.type) {
          case 'Quantitative':
            lyr.style.fill.count = payload.count;

            updateLayerChannel(map, lyr, 'fill');
            break;
          default:
            break;
        }

        return ir;
      });
      break;
    }
    case 'color-threshold': {
      ir.update((ir) => {
        const lyr = ir.layers[layerId] as
          | CartoKitPointLayer
          | CartoKitChoroplethLayer
          | CartoKitProportionalSymbolLayer;

        switch (lyr.style.fill?.type) {
          case 'Quantitative':
            lyr.style.fill.thresholds[payload.index] = payload.threshold;

            updateLayerChannel(map, lyr, 'fill');
            break;
          default:
            break;
        }

        return ir;
      });
      break;
    }
    case 'size': {
      ir.update((ir) => {
        const lyr = ir.layers[layerId] as CartoKitProportionalSymbolLayer;
        lyr.style.size.min = payload.min ?? lyr.style.size.min;
        lyr.style.size.max = payload.max ?? lyr.style.size.max;

        updateLayerChannel(map, lyr, 'size');

        return ir;
      });
      break;
    }
    case 'dot-value': {
      ir.update((ir) => {
        const lyr = ir.layers[layerId] as CartoKitDotDensityLayer;
        lyr.style.dots.value = payload.value;

        updateLayerChannel(map, lyr, 'dots');

        return ir;
      });
      break;
    }
    case 'transformation': {
      ir.update((ir) => {
        const lyr = ir.layers[layerId];
        lyr.data.geojson = payload.geojson;

        const transformationIndex = lyr.data.transformations.findIndex(
          (t) => t.name === payload.transformation.name
        );
        lyr.data.transformations =
          transformationIndex > -1
            ? [
                ...lyr.data.transformations.slice(transformationIndex),
                payload.transformation,
                ...lyr.data.transformations.slice(transformationIndex + 1)
              ]
            : [...lyr.data.transformations, payload.transformation];

        // Update the source with the new data.
        (map.getSource(layerId) as GeoJSONSource).setData(payload.geojson);

        return ir;
      });
      break;
    }
    case 'visualization-type': {
      ir.update((ir) => {
        const lyr = ir.layers[layerId] as
          | CartoKitChoroplethLayer
          | CartoKitProportionalSymbolLayer;

        let fill: QuantitativeFill | CategoricalFill | ConstantFill;

        switch (payload.visualizationType) {
          case 'Categorical': {
            const attribute = selectCategoricalAttribute(
              lyr.data.geojson.features
            );

            fill = {
              type: payload.visualizationType,
              attribute,
              categories: enumerateAttributeCategories(
                lyr.data.geojson.features,
                attribute
              ),
              scheme: DEFAULT_CATEGORICAL_SCHEME,
              opacity: lyr.style.fill?.opacity ?? DEFAULT_OPACITY
            };
            break;
          }
          case 'Quantitative': {
            const attribute = selectQuantitativeAttribute(
              lyr.data.geojson.features
            );

            fill = {
              type: payload.visualizationType,
              attribute: attribute,
              method: 'Quantile',
              scheme: DEFAULT_QUANTITATIVE_SCHEME,
              count: DEFAULT_COUNT,
              thresholds: DEFAULT_THRESHOLDS(lyr.id, attribute),
              opacity: lyr.style.fill?.opacity ?? DEFAULT_OPACITY
            };
            break;
          }
          case 'Constant':
            fill = {
              type: payload.visualizationType,
              color: DEFAULT_FILL,
              opacity: DEFAULT_OPACITY
            };
            break;
        }

        lyr.style.fill = fill;
        updateLayerChannel(map, lyr, 'fill');

        return ir;
      });
    }
  }

  if (
    type !== 'classification-method' ||
    (type === 'classification-method' &&
      'method' in payload &&
      payload.method !== 'Manual')
  ) {
    performance.mark('reconciliation-end');
    const { duration } = performance.measure(
      'reconciliation',
      'reconciliation-start',
      'reconciliation-end'
    );

    console.log('recon', duration, window.programId);
  }
}
