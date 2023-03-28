import type { Map, GeoJSONSource } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';

import { deriveColorScale } from '$lib/interaction/color';
import {
  deriveDotDensityStartingValue,
  deriveSize,
  generateDotDensityPoints
} from '$lib/interaction/geometry';
import { transitionMapType } from '$lib/interaction/map-type';
import { layers } from '$lib/stores/layers';
import {
  hasAttribute,
  isChoroplethLayer,
  isDotDensityLayer,
  isFillLayer,
  isProportionalSymbolLayer,
  type CartoKitLayer
} from '$lib/types/CartoKitLayer';
import type { ColorScale } from '$lib/types/ColorScales';
import type { MapType } from '$lib/types/MapTypes';
import { randomColor } from '$lib/utils/color';

interface LayerUpdate {
  map: Map;
  layer: CartoKitLayer;
}

interface MapTypeUpdate extends LayerUpdate {
  type: 'map-type';
  payload: {
    mapType: MapType;
  };
}

interface ColorScaleTypeUpdate extends LayerUpdate {
  type: 'color-scale-type';
  payload: {
    scale: ColorScale;
  };
}

interface ColorPaletteColorUpdate extends LayerUpdate {
  type: 'color-palette-color';
  payload: {
    index: number;
    color: string;
  };
}

interface ColorPaletteStopsUpdate extends LayerUpdate {
  type: 'color-palette-stops';
  payload: {
    count: number;
  };
}

interface AttributeUpdate extends LayerUpdate {
  type: 'attribute';
  payload: {
    attribute: string;
  };
}

interface FillUpdate extends LayerUpdate {
  type: 'fill';
  payload: {
    color: string;
  };
}

interface FillOpacityUpdate extends LayerUpdate {
  type: 'opacity';
  payload: {
    opacity: number;
  };
}

interface InitialDataUpdate extends LayerUpdate {
  type: 'initial-data';
  payload: {
    geoJSON: FeatureCollection;
  };
}

interface SizeUpdate extends LayerUpdate {
  type: 'size';
  payload: {
    min?: number;
    max?: number;
  };
}

interface DotSizeUpdate extends LayerUpdate {
  type: 'dot-size';
  payload: {
    size: number;
  };
}

interface DotValueUpdate extends LayerUpdate {
  type: 'dot-value';
  payload: {
    value: number;
  };
}

type DispatchLayerUpdateParams =
  | MapTypeUpdate
  | ColorScaleTypeUpdate
  | ColorPaletteColorUpdate
  | ColorPaletteStopsUpdate
  | AttributeUpdate
  | FillUpdate
  | FillOpacityUpdate
  | InitialDataUpdate
  | SizeUpdate
  | DotSizeUpdate
  | DotValueUpdate;

/**
 * Dispatch standardized updates to specific layers.
 *
 * @param type – The type of update to dispatch.
 * @param map – The top-level MapLibre GL map instance.
 * @param layer – The CartoKit layer to update.
 * @param payload – The payload for the update.
 */
export function dispatchLayerUpdate({
  type,
  map,
  layer,
  payload
}: DispatchLayerUpdateParams): void {
  switch (type) {
    case 'map-type': {
      const targetLayer = transitionMapType({
        map,
        layer,
        targetMapType: payload.mapType
      });

      layers.update((lyrs) => {
        lyrs[layer.id] = targetLayer;

        return lyrs;
      });
      break;
    }
    case 'color-scale-type': {
      layers.update((lyrs) => {
        const lyr = lyrs[layer.id];

        if (isChoroplethLayer(lyr)) {
          lyr.style.breaks.scale = payload.scale;

          map.setPaintProperty(lyr.id, 'fill-color', deriveColorScale(lyr));
        }

        return lyrs;
      });
      break;
    }
    case 'color-palette-color': {
      layers.update((lyrs) => {
        const lyr = lyrs[layer.id];

        if (isChoroplethLayer(lyr)) {
          lyr.style.breaks.colors[payload.index] = payload.color;

          map.setPaintProperty(lyr.id, 'fill-color', deriveColorScale(lyr));
        }

        return lyrs;
      });
      break;
    }
    case 'color-palette-stops': {
      layers.update((lyrs) => {
        const lyr = lyrs[layer.id];

        if (isChoroplethLayer(lyr)) {
          const diff = payload.count - lyr.style.breaks.colors.length;

          if (Math.sign(diff) === 1) {
            lyr.style.breaks.colors = lyr.style.breaks.colors.concat(
              new Array(diff).fill(undefined).map(randomColor)
            );
          } else if (Math.sign(diff) === -1) {
            lyr.style.breaks.colors = lyr.style.breaks.colors.slice(
              0,
              lyr.style.breaks.colors.length + diff
            );
          }

          map.setPaintProperty(lyr.id, 'fill-color', deriveColorScale(lyr));
        }

        return lyrs;
      });
      break;
    }
    case 'attribute': {
      layers.update((lyrs) => {
        const lyr = lyrs[layer.id];

        if (hasAttribute(lyr)) {
          lyr.attribute = payload.attribute;

          switch (lyr.type) {
            case 'Choropleth':
              map.setPaintProperty(lyr.id, 'fill-color', deriveColorScale(lyr));
              break;
            case 'Proportional Symbol':
              map.setPaintProperty(lyr.id, 'circle-radius', deriveSize(lyr));
              break;
            case 'Dot Density': {
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
        }

        return lyrs;
      });
      break;
    }
    case 'fill': {
      layers.update((lyrs) => {
        const lyr = lyrs[layer.id];

        if (isFillLayer(lyr)) {
          lyr.style.fill = payload.color;

          map.setPaintProperty(layer.id, 'fill-color', payload.color);
        } else if (isProportionalSymbolLayer(lyr) || isDotDensityLayer(lyr)) {
          lyr.style.fill = payload.color;

          map.setPaintProperty(layer.id, 'circle-color', payload.color);
        }

        return lyrs;
      });
      break;
    }
    case 'opacity': {
      layers.update((lyrs) => {
        const lyr = lyrs[layer.id];

        if (isFillLayer(lyr) || isChoroplethLayer(lyr)) {
          layer.style.opacity = payload.opacity;

          map.setPaintProperty(layer.id, 'fill-opacity', payload.opacity);
        } else if (isProportionalSymbolLayer(lyr)) {
          lyr.style.opacity = payload.opacity;

          map.setPaintProperty(layer.id, 'circle-opacity', payload.opacity);
        }

        return lyrs;
      });
      break;
    }
    case 'initial-data': {
      layers.update((lyrs) => {
        const lyr = lyrs[layer.id];

        if (lyr) {
          lyr.data.geoJSON = payload.geoJSON;

          // The initial data loaded for a layer gets preserved in the rawGeoJSON property.
          // This allows us to recover polygons when we do things like transition to points
          // and subsequently back to polygons.
          lyr.data.rawGeoJSON = payload.geoJSON;
        }

        return lyrs;
      });
      break;
    }
    case 'size': {
      layers.update((lyrs) => {
        const lyr = lyrs[layer.id];

        if (isProportionalSymbolLayer(lyr)) {
          if (payload.min) {
            lyr.style.size.min = payload.min;
          }

          if (payload.max) {
            lyr.style.size.max = payload.max;
          }

          map.setPaintProperty(layer.id, 'circle-radius', deriveSize(lyr));
        }

        return lyrs;
      });
      break;
    }
    case 'dot-size': {
      layers.update((lyrs) => {
        const lyr = lyrs[layer.id];

        if (isDotDensityLayer(lyr)) {
          lyr.style.dots.size = payload.size;

          map.setPaintProperty(layer.id, 'circle-radius', payload.size);
        }

        return lyrs;
      });
      break;
    }
    case 'dot-value': {
      layers.update((lyrs) => {
        const lyr = lyrs[layer.id];

        // This update requires recomputing and redrawing the dot density layer.
        if (isDotDensityLayer(lyr)) {
          lyr.style.dots.value = payload.value;

          // We always use the rawGeoJSON to generate the dot density points.
          // These _must_ be polygons to support the transition to dot density;
          // conversely, the current layer geometry will be points, which do not
          // allow us to generate a dot density.
          const features = generateDotDensityPoints({
            features: lyr.data.rawGeoJSON.features,
            attribute: lyr.attribute,
            value: payload.value
          });

          lyr.data.geoJSON = features;
          // Update the source with the new data.
          (map.getSource(layer.id) as GeoJSONSource).setData(features);
        }

        return lyrs;
      });
      break;
    }
  }
}
