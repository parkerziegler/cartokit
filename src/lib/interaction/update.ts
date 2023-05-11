import type { GeoJSONSource } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import { get } from 'svelte/store';

import { deriveColorScale } from '$lib/interaction/color';
import {
  deriveDotDensityStartingValue,
  deriveSize,
  generateDotDensityPoints
} from '$lib/interaction/geometry';
import { transitionMapType } from '$lib/interaction/map-type';
import { deriveThresholds } from '$lib/interaction/scales';
import { layers } from '$lib/stores/layers';
import { map as mapStore } from '$lib/stores/map';
import type {
  CartoKitLayer,
  CartoKitFillLayer,
  CartoKitChoroplethLayer,
  CartoKitProportionalSymbolLayer,
  CartoKitDotDensityLayer
} from '$lib/types/CartoKitLayer';
import type { ColorScale, ColorScheme } from '$lib/types/color';
import type { MapType } from '$lib/types/map-types';
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

interface InitialDataUpdate extends LayerUpdate {
  type: 'initial-data';
  payload: {
    geoJSON: FeatureCollection;
  };
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
    | CartoKitChoroplethLayer
    | CartoKitProportionalSymbolLayer
    | CartoKitDotDensityLayer;
}

interface FillUpdate extends LayerUpdate {
  type: 'fill';
  payload: {
    color: string;
  };
  layer:
    | CartoKitFillLayer
    | CartoKitProportionalSymbolLayer
    | CartoKitDotDensityLayer;
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
  layer:
    | CartoKitFillLayer
    | CartoKitProportionalSymbolLayer
    | CartoKitDotDensityLayer;
}

interface RemoveFillUpdate extends LayerUpdate {
  type: 'remove-fill';
  payload: Record<string, never>;
  layer:
    | CartoKitFillLayer
    | CartoKitProportionalSymbolLayer
    | CartoKitDotDensityLayer;
}

interface StrokeUpdate extends LayerUpdate {
  type: 'stroke';
  payload: {
    color: string;
  };
  layer: CartoKitLayer;
}

interface StrokeWidthUpdate extends LayerUpdate {
  type: 'stroke-width';
  payload: {
    strokeWidth: number;
  };
  layer: CartoKitLayer;
}

interface StrokeOpacityUpdate extends LayerUpdate {
  type: 'stroke-opacity';
  payload: {
    opacity: number;
  };
  layer: CartoKitLayer;
}

interface AddStrokeUpdate extends LayerUpdate {
  type: 'add-stroke';
  payload: Record<string, never>;
  layer: CartoKitLayer;
}

interface RemoveStrokeUpdate extends LayerUpdate {
  type: 'remove-stroke';
  payload: Record<string, never>;
  layer: CartoKitLayer;
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

interface DotSizeUpdate extends LayerUpdate {
  type: 'dot-size';
  payload: {
    size: number;
  };
  layer: CartoKitDotDensityLayer;
}

interface DotValueUpdate extends LayerUpdate {
  type: 'dot-value';
  payload: {
    value: number;
  };
  layer: CartoKitDotDensityLayer;
}

type DispatchLayerUpdateParams =
  | InitialDataUpdate
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
  | ColorScaleUpdate
  | ColorSchemeUpdate
  | ColorCountUpdate
  | ColorThresholdUpdate
  | SizeUpdate
  | DotSizeUpdate
  | DotValueUpdate;

/**
 * Dispatch standardized updates to specific layers.
 *
 * @param params – Required parameters for the layer update.
 * @param type – The type of update to dispatch.
 * @param layer – The CartoKit layer to update.
 * @param payload – The payload for the update.
 */
export function dispatchLayerUpdate({
  type,
  layer,
  payload
}: DispatchLayerUpdateParams): void {
  const map = get(mapStore);

  switch (type) {
    case 'initial-data': {
      layers.update((lyrs) => {
        const lyr = lyrs[layer.id];
        lyr.data.geoJSON = payload.geoJSON;
        // The initial data loaded for a layer gets preserved in the rawGeoJSON property.
        // This allows us to recover polygons when we do things like transition to points
        // and subsequently back to polygons.
        lyr.data.rawGeoJSON = payload.geoJSON;

        return lyrs;
      });
      break;
    }
    case 'map-type': {
      layers.update((lyrs) => {
        lyrs[layer.id] = transitionMapType({
          map,
          layer,
          targetMapType: payload.mapType
        });

        return lyrs;
      });
      break;
    }
    case 'attribute': {
      layers.update((lyrs) => {
        // We guarantee that layer is a CartoKitLayer with an attribute when we dispatch
        // this update. Therefore, accessing that same layer in the store by id
        // guarantees that lyr has an attribute property.
        const lyr = lyrs[layer.id] as
          | CartoKitChoroplethLayer
          | CartoKitProportionalSymbolLayer
          | CartoKitDotDensityLayer;

        switch (lyr.type) {
          case 'Choropleth':
            lyr.style.fill.attribute = payload.attribute;
            map.setPaintProperty(lyr.id, 'fill-color', deriveColorScale(lyr));
            break;
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
              features: lyr.data.rawGeoJSON.features,
              attribute: payload.attribute,
              value: dotValue
            });

            lyr.data.geoJSON = features;
            lyr.style.dots.value = dotValue;

            // Update the source with the new data.
            (map.getSource(layer.id) as GeoJSONSource).setData(features);
            break;
          }
        }

        return lyrs;
      });
      break;
    }
    case 'fill': {
      layers.update((lyrs) => {
        const lyr = lyrs[layer.id] as
          | CartoKitFillLayer
          | CartoKitProportionalSymbolLayer
          | CartoKitDotDensityLayer;

        if (lyr.style.fill) {
          lyr.style.fill.color = payload.color;

          switch (lyr.type) {
            case 'Fill':
              map.setPaintProperty(layer.id, 'fill-color', payload.color);
              break;
            case 'Proportional Symbol':
            case 'Dot Density':
              map.setPaintProperty(layer.id, 'circle-color', payload.color);
              break;
          }
        }

        return lyrs;
      });
      break;
    }
    case 'fill-opacity': {
      layers.update((lyrs) => {
        const lyr = lyrs[layer.id];

        if (lyr.style.fill) {
          lyr.style.fill.opacity = payload.opacity;

          switch (lyr.type) {
            case 'Fill':
            case 'Choropleth':
              map.setPaintProperty(layer.id, 'fill-opacity', payload.opacity);
              break;
            case 'Proportional Symbol':
            case 'Dot Density':
              map.setPaintProperty(layer.id, 'circle-opacity', payload.opacity);
              break;
          }
        }

        return lyrs;
      });
      break;
    }
    case 'add-fill': {
      layers.update((lyrs) => {
        const lyr = lyrs[layer.id];
        lyr.style.fill = {
          color: DEFAULT_FILL,
          opacity: DEFAULT_OPACITY
        };

        switch (lyr.type) {
          case 'Fill':
          case 'Choropleth':
            map.setPaintProperty(layer.id, 'fill-color', DEFAULT_FILL);
            map.setPaintProperty(layer.id, 'fill-opacity', DEFAULT_OPACITY);
            break;
          case 'Proportional Symbol':
          case 'Dot Density':
            map.setPaintProperty(layer.id, 'circle-color', DEFAULT_FILL);
            map.setPaintProperty(layer.id, 'circle-opacity', DEFAULT_OPACITY);
            break;
        }

        return lyrs;
      });
      break;
    }
    case 'remove-fill': {
      layers.update((lyrs) => {
        const lyr = lyrs[layer.id];
        lyr.style.fill = undefined;

        switch (lyr.type) {
          case 'Fill':
            map.setPaintProperty(layer.id, 'fill-color', 'transparent');
            map.setPaintProperty(layer.id, 'fill-opacity', 0);
            break;
          case 'Proportional Symbol':
          case 'Dot Density':
            map.setPaintProperty(layer.id, 'circle-color', 'transparent');
            map.setPaintProperty(layer.id, 'circle-opacity', 0);
            break;
          default:
            break;
        }

        return lyrs;
      });
      break;
    }
    case 'stroke': {
      layers.update((lyrs) => {
        const lyr = lyrs[layer.id];
        if (lyr.style.stroke) {
          lyr.style.stroke.color = payload.color;

          switch (lyr.type) {
            case 'Fill':
            case 'Choropleth':
              map.setPaintProperty(
                `${layer.id}-stroke`,
                'line-color',
                payload.color
              );
              break;
            case 'Proportional Symbol':
            case 'Dot Density':
              map.setPaintProperty(
                layer.id,
                'circle-stroke-color',
                payload.color
              );
              break;
          }
        }

        return lyrs;
      });
      break;
    }
    case 'stroke-width': {
      layers.update((lyrs) => {
        const lyr = lyrs[layer.id];

        if (lyr.style.stroke) {
          lyr.style.stroke.width = payload.strokeWidth;

          switch (lyr.type) {
            case 'Fill':
            case 'Choropleth':
              map.setPaintProperty(
                `${layer.id}-stroke`,
                'line-width',
                payload.strokeWidth
              );
              break;
            case 'Proportional Symbol':
            case 'Dot Density':
              map.setPaintProperty(
                layer.id,
                'circle-stroke-width',
                payload.strokeWidth
              );
              break;
          }
        }

        return lyrs;
      });
      break;
    }
    case 'stroke-opacity': {
      layers.update((lyrs) => {
        const lyr = lyrs[layer.id];

        if (lyr.style.stroke) {
          lyr.style.stroke.opacity = payload.opacity;

          switch (lyr.type) {
            case 'Fill':
            case 'Choropleth':
              map.setPaintProperty(
                `${layer.id}-stroke`,
                'line-opacity',
                payload.opacity
              );
              break;
            case 'Proportional Symbol':
            case 'Dot Density':
              map.setPaintProperty(
                layer.id,
                'circle-stroke-opacity',
                payload.opacity
              );
              break;
          }
        }

        return lyrs;
      });
      break;
    }
    case 'add-stroke': {
      layers.update((lyrs) => {
        const lyr = lyrs[layer.id];
        // Create a default stroke.
        lyr.style.stroke = {
          color: DEFAULT_STROKE,
          width: DEFAULT_STROKE_WIDTH,
          opacity: DEFAULT_STROKE_OPACITY
        };

        switch (lyr.type) {
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
        }

        return lyrs;
      });
      break;
    }
    case 'remove-stroke': {
      layers.update((lyrs) => {
        const lyr = lyrs[layer.id];
        lyr.style.stroke = undefined;

        switch (lyr.type) {
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
          default:
            break;
        }

        return lyrs;
      });
      break;
    }
    case 'color-scale': {
      layers.update((lyrs) => {
        // We guarantee that layer is a CartoKitChoroplethLayer when we dispatch
        // this update. Therefore, accessing that same layer in the store by id
        // guarantees that lyr is also a CartoKitChoroplethLayer.
        const lyr = lyrs[layer.id] as CartoKitChoroplethLayer;
        lyr.style.fill.scale = payload.scale;
        lyr.style.fill.thresholds = deriveThresholds({
          scale: payload.scale,
          layer: lyr,
          attribute: lyr.style.fill.attribute,
          features: lyr.data.geoJSON.features,
          range: [...lyr.style.fill.scheme[lyr.style.fill.count]]
        });

        map.setPaintProperty(lyr.id, 'fill-color', deriveColorScale(lyr));

        return lyrs;
      });
      break;
    }
    case 'color-scheme': {
      layers.update((lyrs) => {
        const lyr = lyrs[layer.id] as CartoKitChoroplethLayer;
        lyr.style.fill.scheme = payload.scheme;

        map.setPaintProperty(lyr.id, 'fill-color', deriveColorScale(lyr));

        return lyrs;
      });
      break;
    }
    case 'color-count': {
      layers.update((lyrs) => {
        const lyr = lyrs[layer.id] as CartoKitChoroplethLayer;
        lyr.style.fill.count = payload.count;
        lyr.style.fill.thresholds = deriveThresholds({
          scale: lyr.style.fill.scale,
          layer: lyr,
          attribute: lyr.style.fill.attribute,
          features: lyr.data.geoJSON.features,
          range: [...lyr.style.fill.scheme[payload.count]]
        });

        map.setPaintProperty(lyr.id, 'fill-color', deriveColorScale(lyr));

        return lyrs;
      });
      break;
    }
    case 'color-threshold': {
      layers.update((lyrs) => {
        const lyr = lyrs[layer.id] as CartoKitChoroplethLayer;
        lyr.style.fill.thresholds[payload.index] = payload.threshold;

        map.setPaintProperty(lyr.id, 'fill-color', deriveColorScale(lyr));

        return lyrs;
      });
      break;
    }
    case 'size': {
      layers.update((lyrs) => {
        const lyr = lyrs[layer.id] as CartoKitProportionalSymbolLayer;
        lyr.style.size.min = payload.min ?? lyr.style.size.min;
        lyr.style.size.max = payload.max ?? lyr.style.size.max;

        map.setPaintProperty(layer.id, 'circle-radius', deriveSize(lyr));

        return lyrs;
      });
      break;
    }
    case 'dot-size': {
      layers.update((lyrs) => {
        const lyr = lyrs[layer.id] as CartoKitDotDensityLayer;
        lyr.style.dots.size = payload.size;

        map.setPaintProperty(layer.id, 'circle-radius', payload.size);

        return lyrs;
      });
      break;
    }
    case 'dot-value': {
      layers.update((lyrs) => {
        const lyr = lyrs[layer.id] as CartoKitDotDensityLayer;
        lyr.style.dots.value = payload.value;

        // We always use the rawGeoJSON to generate the dot density points.
        // These _must_ be polygons to support the transition to dot density;
        // conversely, the current layer geometry will be points, which do not
        // allow us to generate a dot density.
        const features = generateDotDensityPoints({
          features: lyr.data.rawGeoJSON.features,
          attribute: lyr.style.dots.attribute,
          value: payload.value
        });

        lyr.data.geoJSON = features;
        // Update the source with the new data.
        (map.getSource(layer.id) as GeoJSONSource).setData(features);

        return lyrs;
      });
      break;
    }
  }
}
