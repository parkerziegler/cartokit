import type {
  FeatureCollection,
  Feature,
  Polygon,
  MultiPolygon
} from 'geojson';
import type { GeoJSONSource } from 'maplibre-gl';
import { get } from 'svelte/store';

import { deriveColorScale } from '$lib/interaction/color';
import {
  deriveDotDensityStartingValue,
  deriveSize,
  generateDotDensityPoints
} from '$lib/interaction/geometry';
import { transitionMapType } from '$lib/interaction/map-type';
import { deriveThresholds } from '$lib/interaction/scales';
import { ir } from '$lib/stores/ir';
import { map as mapStore } from '$lib/stores/map';
import type {
  CartoKitLayer,
  CartoKitPointLayer,
  CartoKitProportionalSymbolLayer,
  CartoKitDotDensityLayer,
  CartoKitFillLayer,
  CartoKitChoroplethLayer
} from '$lib/types/CartoKitLayer';
import type { ColorScale, ColorScheme } from '$lib/types/color';
import type { MapType } from '$lib/types/map-types';
import type { Transformation } from '$lib/types/transformation';
import {
  DEFAULT_FILL,
  DEFAULT_OPACITY,
  DEFAULT_STROKE,
  DEFAULT_STROKE_OPACITY,
  DEFAULT_STROKE_WIDTH
} from '$lib/utils/constants';

interface LayerUpdate {
  layer: CartoKitLayer;
}

interface MapTypeUpdate extends LayerUpdate {
  type: 'map-type';
  payload: {
    mapType: MapType;
  };
}

interface AttributeUpdate extends LayerUpdate {
  type: 'attribute';
  payload: {
    attribute: string;
  };
  layer:
    | CartoKitProportionalSymbolLayer
    | CartoKitDotDensityLayer
    | CartoKitChoroplethLayer;
}

interface FillUpdate extends LayerUpdate {
  type: 'fill';
  payload: {
    color: string;
  };
  layer:
    | CartoKitPointLayer
    | CartoKitProportionalSymbolLayer
    | CartoKitDotDensityLayer
    | CartoKitFillLayer;
}

interface FillOpacityUpdate extends LayerUpdate {
  type: 'fill-opacity';
  payload: {
    opacity: number;
  };
  layer:
    | CartoKitPointLayer
    | CartoKitProportionalSymbolLayer
    | CartoKitDotDensityLayer
    | CartoKitFillLayer
    | CartoKitChoroplethLayer;
}

interface AddFillUpdate extends LayerUpdate {
  type: 'add-fill';
  payload: Record<string, never>;
  layer:
    | CartoKitPointLayer
    | CartoKitProportionalSymbolLayer
    | CartoKitDotDensityLayer
    | CartoKitFillLayer;
}

interface RemoveFillUpdate extends LayerUpdate {
  type: 'remove-fill';
  payload: Record<string, never>;
  layer:
    | CartoKitPointLayer
    | CartoKitProportionalSymbolLayer
    | CartoKitDotDensityLayer
    | CartoKitFillLayer;
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
  layer:
    | CartoKitPointLayer
    | CartoKitProportionalSymbolLayer
    | CartoKitDotDensityLayer
    | CartoKitFillLayer
    | CartoKitChoroplethLayer;
}

interface RemoveStrokeUpdate extends LayerUpdate {
  type: 'remove-stroke';
  payload: Record<string, never>;
  layer:
    | CartoKitPointLayer
    | CartoKitProportionalSymbolLayer
    | CartoKitDotDensityLayer
    | CartoKitFillLayer
    | CartoKitChoroplethLayer;
}

interface PointSizeUpdate extends LayerUpdate {
  type: 'point-size';
  payload: {
    size: number;
  };
  layer: CartoKitPointLayer | CartoKitDotDensityLayer;
}

interface ColorScaleUpdate extends LayerUpdate {
  type: 'color-scale';
  payload: {
    scale: ColorScale;
  };
  layer: CartoKitChoroplethLayer;
}

interface ColorSchemeUpdate extends LayerUpdate {
  type: 'color-scheme';
  payload: {
    scheme: ColorScheme;
  };
  layer: CartoKitChoroplethLayer;
}

interface ColorCountUpdate extends LayerUpdate {
  type: 'color-count';
  payload: {
    count: number;
  };
  layer: CartoKitChoroplethLayer;
}

interface ColorThresholdUpdate extends LayerUpdate {
  type: 'color-threshold';
  payload: {
    index: number;
    threshold: number;
  };
  layer: CartoKitChoroplethLayer;
}

interface SizeUpdate extends LayerUpdate {
  type: 'size';
  payload: {
    min?: number;
    max?: number;
  };
  layer: CartoKitProportionalSymbolLayer;
}

interface DotValueUpdate extends LayerUpdate {
  type: 'dot-value';
  payload: {
    value: number;
  };
  layer: CartoKitDotDensityLayer;
}

interface TransformationUpdate extends LayerUpdate {
  type: 'transformation';
  payload: {
    geoJSON: FeatureCollection;
    transformation: Transformation;
  };
}

type DispatchLayerUpdateParams =
  | MapTypeUpdate
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
  | ColorScaleUpdate
  | ColorSchemeUpdate
  | ColorCountUpdate
  | ColorThresholdUpdate
  | SizeUpdate
  | DotValueUpdate
  | TransformationUpdate;

/**
 * Dispatch standardized updates to specific layers.
 *
 * @param params – Required parameters for the layer update.
 * @param type – The type of update to dispatch.
 * @param layer – The CartoKit layer to update.
 * @param payload – The payload for the update.
 */
export const dispatchLayerUpdate = ({
  type,
  layer,
  payload
}: DispatchLayerUpdateParams): void => {
  const map = get(mapStore);

  switch (type) {
    case 'map-type': {
      ir.update((ir) => {
        ir.layers[layer.id] = transitionMapType({
          map,
          layer,
          targetMapType: payload.mapType
        });

        return ir;
      });
      break;
    }
    case 'attribute': {
      ir.update((ir) => {
        // We guarantee that layer is a CartoKitLayer with an attribute when we dispatch
        // this update. Therefore, accessing that same layer in the store by id
        // guarantees that lyr has an attribute property.
        const lyr = ir.layers[layer.id] as
          | CartoKitProportionalSymbolLayer
          | CartoKitDotDensityLayer
          | CartoKitChoroplethLayer;

        switch (lyr.type) {
          case 'Proportional Symbol':
            lyr.style.size.attribute = payload.attribute;
            map.setPaintProperty(lyr.id, 'circle-radius', deriveSize(lyr));
            break;
          case 'Dot Density': {
            lyr.style.dots.attribute = payload.attribute;
            const dotValue = deriveDotDensityStartingValue(
              lyr.data.rawGeoJSON.features,
              payload.attribute
            );

            const features = generateDotDensityPoints({
              features: lyr.data.rawGeoJSON.features as Feature<
                Polygon | MultiPolygon
              >[],
              attribute: payload.attribute,
              value: dotValue
            });

            lyr.data.geoJSON = features;
            lyr.style.dots.value = dotValue;

            // Update the source with the new data.
            (map.getSource(layer.id) as GeoJSONSource).setData(features);
            break;
          }
          case 'Choropleth':
            lyr.style.fill.attribute = payload.attribute;
            map.setPaintProperty(lyr.id, 'fill-color', deriveColorScale(lyr));
            break;
        }

        return ir;
      });
      break;
    }
    case 'fill': {
      ir.update((ir) => {
        const lyr = ir.layers[layer.id] as
          | CartoKitPointLayer
          | CartoKitProportionalSymbolLayer
          | CartoKitDotDensityLayer
          | CartoKitFillLayer;

        if (lyr.style.fill) {
          lyr.style.fill.color = payload.color;

          switch (lyr.type) {
            case 'Point':
            case 'Proportional Symbol':
            case 'Dot Density':
              map.setPaintProperty(layer.id, 'circle-color', payload.color);
              break;
            case 'Fill':
              map.setPaintProperty(layer.id, 'fill-color', payload.color);
              break;
          }
        }

        return ir;
      });
      break;
    }
    case 'fill-opacity': {
      ir.update((ir) => {
        const lyr = ir.layers[layer.id] as
          | CartoKitPointLayer
          | CartoKitProportionalSymbolLayer
          | CartoKitDotDensityLayer
          | CartoKitFillLayer
          | CartoKitChoroplethLayer;

        if (lyr.style.fill) {
          lyr.style.fill.opacity = payload.opacity;

          switch (lyr.type) {
            case 'Point':
            case 'Proportional Symbol':
            case 'Dot Density':
              map.setPaintProperty(layer.id, 'circle-opacity', payload.opacity);
              break;
            case 'Fill':
            case 'Choropleth':
              map.setPaintProperty(layer.id, 'fill-opacity', payload.opacity);
              break;
          }
        }

        return ir;
      });
      break;
    }
    case 'add-fill': {
      ir.update((ir) => {
        const lyr = ir.layers[layer.id] as
          | CartoKitPointLayer
          | CartoKitProportionalSymbolLayer
          | CartoKitDotDensityLayer
          | CartoKitFillLayer;
        lyr.style.fill = {
          color: DEFAULT_FILL,
          opacity: DEFAULT_OPACITY
        };

        switch (lyr.type) {
          case 'Point':
          case 'Proportional Symbol':
          case 'Dot Density':
            map.setPaintProperty(layer.id, 'circle-color', DEFAULT_FILL);
            map.setPaintProperty(layer.id, 'circle-opacity', DEFAULT_OPACITY);
            break;
          case 'Fill':
            map.setPaintProperty(layer.id, 'fill-color', DEFAULT_FILL);
            map.setPaintProperty(layer.id, 'fill-opacity', DEFAULT_OPACITY);
            break;
        }

        return ir;
      });
      break;
    }
    case 'remove-fill': {
      ir.update((ir) => {
        const lyr = ir.layers[layer.id] as
          | CartoKitPointLayer
          | CartoKitProportionalSymbolLayer
          | CartoKitDotDensityLayer
          | CartoKitFillLayer;
        lyr.style.fill = undefined;

        switch (lyr.type) {
          case 'Point':
          case 'Proportional Symbol':
          case 'Dot Density':
            map.setPaintProperty(layer.id, 'circle-color', 'transparent');
            map.setPaintProperty(layer.id, 'circle-opacity', 0);
            break;
          case 'Fill':
            map.setPaintProperty(layer.id, 'fill-color', 'transparent');
            map.setPaintProperty(layer.id, 'fill-opacity', 0);
            break;
        }

        return ir;
      });
      break;
    }
    case 'stroke': {
      ir.update((ir) => {
        const lyr = ir.layers[layer.id];
        if (lyr.style.stroke) {
          lyr.style.stroke.color = payload.color;

          switch (lyr.type) {
            case 'Point':
            case 'Proportional Symbol':
            case 'Dot Density':
              map.setPaintProperty(
                layer.id,
                'circle-stroke-color',
                payload.color
              );
              break;
            case 'Line':
              map.setPaintProperty(layer.id, 'line-color', payload.color);
              break;
            case 'Fill':
            case 'Choropleth':
              map.setPaintProperty(
                `${layer.id}-stroke`,
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
        const lyr = ir.layers[layer.id];

        if (lyr.style.stroke) {
          lyr.style.stroke.width = payload.strokeWidth;

          switch (lyr.type) {
            case 'Point':
            case 'Proportional Symbol':
            case 'Dot Density':
              map.setPaintProperty(
                layer.id,
                'circle-stroke-width',
                payload.strokeWidth
              );
              break;
            case 'Line':
              map.setPaintProperty(layer.id, 'line-width', payload.strokeWidth);
              break;
            case 'Fill':
            case 'Choropleth':
              map.setPaintProperty(
                `${layer.id}-stroke`,
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
        const lyr = ir.layers[layer.id];

        if (lyr.style.stroke) {
          lyr.style.stroke.opacity = payload.opacity;

          switch (lyr.type) {
            case 'Point':
            case 'Proportional Symbol':
            case 'Dot Density':
              map.setPaintProperty(
                layer.id,
                'circle-stroke-opacity',
                payload.opacity
              );
              break;
            case 'Line':
              map.setPaintProperty(layer.id, 'line-opacity', payload.opacity);
              break;
            case 'Fill':
            case 'Choropleth':
              map.setPaintProperty(
                `${layer.id}-stroke`,
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
        const lyr = ir.layers[layer.id] as
          | CartoKitPointLayer
          | CartoKitProportionalSymbolLayer
          | CartoKitDotDensityLayer
          | CartoKitFillLayer
          | CartoKitChoroplethLayer;
        // Create a default stroke.
        lyr.style.stroke = {
          color: DEFAULT_STROKE,
          width: DEFAULT_STROKE_WIDTH,
          opacity: DEFAULT_STROKE_OPACITY
        };

        switch (lyr.type) {
          case 'Point':
          case 'Proportional Symbol':
          case 'Dot Density':
            map.setPaintProperty(
              layer.id,
              'circle-stroke-color',
              DEFAULT_STROKE
            );
            map.setPaintProperty(
              layer.id,
              'circle-stroke-width',
              DEFAULT_STROKE_WIDTH
            );
            map.setPaintProperty(
              layer.id,
              'circle-stroke-opacity',
              DEFAULT_STROKE_OPACITY
            );
            break;
          case 'Fill':
          case 'Choropleth':
            map.setPaintProperty(
              `${layer.id}-stroke`,
              'line-color',
              DEFAULT_STROKE
            );
            map.setPaintProperty(
              `${layer.id}-stroke`,
              'line-width',
              DEFAULT_STROKE_WIDTH
            );
            map.setPaintProperty(
              `${layer.id}-stroke`,
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
        const lyr = ir.layers[layer.id] as
          | CartoKitPointLayer
          | CartoKitProportionalSymbolLayer
          | CartoKitDotDensityLayer
          | CartoKitFillLayer
          | CartoKitChoroplethLayer;
        lyr.style.stroke = undefined;

        switch (lyr.type) {
          case 'Point':
          case 'Proportional Symbol':
          case 'Dot Density':
            map.setPaintProperty(
              layer.id,
              'circle-stroke-color',
              'transparent'
            );
            map.setPaintProperty(layer.id, 'circle-stroke-width', 0);
            map.setPaintProperty(layer.id, 'circle-stroke-opacity', 0);
            break;
          case 'Fill':
          case 'Choropleth':
            map.setPaintProperty(
              `${layer.id}-stroke`,
              'line-color',
              'transparent'
            );
            map.setPaintProperty(`${layer.id}-stroke`, 'line-width', 0);
            map.setPaintProperty(`${layer.id}-stroke`, 'line-opacity', 0);
            break;
        }

        return ir;
      });
      break;
    }
    case 'point-size': {
      ir.update((ir) => {
        const lyr = ir.layers[layer.id] as
          | CartoKitPointLayer
          | CartoKitDotDensityLayer;
        lyr.type === 'Point'
          ? (lyr.style.size = payload.size)
          : (lyr.style.dots.size = payload.size);

        map.setPaintProperty(layer.id, 'circle-radius', payload.size);

        return ir;
      });
      break;
    }
    case 'color-scale': {
      ir.update((ir) => {
        // We guarantee that layer is a CartoKitChoroplethLayer when we dispatch
        // this update. Therefore, accessing that same layer in the store by id
        // guarantees that lyr is also a CartoKitChoroplethLayer.
        const lyr = ir.layers[layer.id] as CartoKitChoroplethLayer;
        lyr.style.fill.scale = payload.scale;
        lyr.style.fill.thresholds = deriveThresholds({
          scale: payload.scale,
          layer: lyr,
          attribute: lyr.style.fill.attribute,
          features: lyr.data.geoJSON.features,
          range: [...lyr.style.fill.scheme[lyr.style.fill.count]]
        });

        map.setPaintProperty(lyr.id, 'fill-color', deriveColorScale(lyr));

        return ir;
      });
      break;
    }
    case 'color-scheme': {
      ir.update((ir) => {
        const lyr = ir.layers[layer.id] as CartoKitChoroplethLayer;
        lyr.style.fill.scheme = payload.scheme;

        map.setPaintProperty(lyr.id, 'fill-color', deriveColorScale(lyr));

        return ir;
      });
      break;
    }
    case 'color-count': {
      ir.update((ir) => {
        const lyr = ir.layers[layer.id] as CartoKitChoroplethLayer;
        lyr.style.fill.count = payload.count;
        lyr.style.fill.thresholds = deriveThresholds({
          scale: lyr.style.fill.scale,
          layer: lyr,
          attribute: lyr.style.fill.attribute,
          features: lyr.data.geoJSON.features,
          range: [...lyr.style.fill.scheme[payload.count]]
        });

        map.setPaintProperty(lyr.id, 'fill-color', deriveColorScale(lyr));

        return ir;
      });
      break;
    }
    case 'color-threshold': {
      ir.update((ir) => {
        const lyr = ir.layers[layer.id] as CartoKitChoroplethLayer;
        lyr.style.fill.thresholds[payload.index] = payload.threshold;

        map.setPaintProperty(lyr.id, 'fill-color', deriveColorScale(lyr));

        return ir;
      });
      break;
    }
    case 'size': {
      ir.update((ir) => {
        const lyr = ir.layers[layer.id] as CartoKitProportionalSymbolLayer;
        lyr.style.size.min = payload.min ?? lyr.style.size.min;
        lyr.style.size.max = payload.max ?? lyr.style.size.max;

        map.setPaintProperty(layer.id, 'circle-radius', deriveSize(lyr));

        return ir;
      });
      break;
    }
    case 'dot-value': {
      ir.update((ir) => {
        const lyr = ir.layers[layer.id] as CartoKitDotDensityLayer;
        lyr.style.dots.value = payload.value;

        // We always use the rawGeoJSON to generate the dot density points.
        // These _must_ be polygons to support the transition to dot density;
        // conversely, the current layer geometry will be points, which do not
        // allow us to generate a dot density.
        const features = generateDotDensityPoints({
          features: lyr.data.rawGeoJSON.features as Feature<
            Polygon | MultiPolygon
          >[],
          attribute: lyr.style.dots.attribute,
          value: payload.value
        });

        lyr.data.geoJSON = features;
        // Update the source with the new data.
        (map.getSource(layer.id) as GeoJSONSource).setData(features);

        return ir;
      });
      break;
    }
    case 'transformation': {
      ir.update((ir) => {
        const lyr = ir.layers[layer.id];
        lyr.data.geoJSON = payload.geoJSON;

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
        (map.getSource(layer.id) as GeoJSONSource).setData(payload.geoJSON);

        return ir;
      });
    }
  }
};
