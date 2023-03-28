import type { Map, GeoJSONSource } from 'maplibre-gl';

import { deriveColorScale } from '$lib/interaction/color';
import {
  generateDotDensityPoints,
  deriveDotDensityStartingValue,
  deriveCentroids
} from '$lib/interaction/geometry';
import { addLayer } from '$lib/interaction/layer';
import { listeners, type LayerListeners } from '$lib/stores/listeners';
import type {
  CartoKitFillLayer,
  CartoKitChoroplethLayer,
  CartoKitProportionalSymbolLayer,
  CartoKitDotDensityLayer,
  CartoKitLayer
} from '$lib/types/CartoKitLayer';
import type { MapType } from '$lib/types/MapTypes';
import { randomColor } from '$lib/utils/color';
import {
  DEFAULT_MAX_SIZE,
  DEFAULT_MIN_SIZE,
  DEFAULT_PALETTE
} from '$lib/utils/constants';
import {
  getFeatureCollectionType,
  selectNumericAttribute
} from '$lib/utils/geojson';
import { getInstrumetedLayerIds } from '$lib/utils/layer';

interface TransitionMapTypeParams {
  map: Map;
  layer: CartoKitLayer;
  targetMapType: MapType;
}

interface TransitionMapTypeReturnValue {
  targetLayer: CartoKitLayer;
  redraw: boolean;
}

/**
 * Transition a layer from one map type to another. For cross-geometry transitions,
 * this will create a new layer and remove the previous layer.
 *
 * @param map — The top-level MapLibre GL map instance.
 * @param layer — The CartoKitLayer to transition.
 * @param targetMapType — The map type to transition to.
 *
 * @returns — The transitioned CartoKitLayer.
 */
export function transitionMapType({
  map,
  layer,
  targetMapType
}: TransitionMapTypeParams): CartoKitLayer {
  let redraw = false;
  let targetLayer: CartoKitLayer;

  switch (targetMapType) {
    case 'Fill': {
      const { redraw: rd, targetLayer: tl } = transitionToFill(map, layer);
      redraw = rd;
      targetLayer = tl;
      break;
    }
    case 'Choropleth': {
      const { redraw: rd, targetLayer: tl } = transitionToChoropleth(
        map,
        layer
      );
      redraw = rd;
      targetLayer = tl;
      break;
    }
    case 'Proportional Symbol': {
      const { redraw: rd, targetLayer: tl } =
        transitionToProportionalSymbol(layer);
      redraw = rd;
      targetLayer = tl;
      break;
    }
    case 'Dot Density': {
      const { redraw: rd, targetLayer: tl } = transitionToDotDensity(layer);
      redraw = rd;
      targetLayer = tl;
      break;
    }
  }

  if (redraw) {
    // Remove all event listeners for the existing layer.
    listeners.update((ls) => {
      if (ls.has(layer.id)) {
        // This is a safe non-null assertion — we know the listeners exist via the call to .has.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        Object.entries(ls.get(layer.id)!).forEach(([event, listener]) => {
          map.off(event as keyof LayerListeners, layer.id, listener);
        });
      }

      ls.delete(layer.id);

      return ls;
    });

    // Remove the existing layer and all instrumented layers.
    map.removeLayer(layer.id);

    getInstrumetedLayerIds(layer).forEach((id) => {
      if (map.getLayer(id)) {
        map.removeLayer(id);
      }
    });

    // Update the source with the new data.
    (map.getSource(layer.id) as GeoJSONSource).setData(
      targetLayer.data.geoJSON
    );

    // Add the new layer. This function call includes instrumentation.
    addLayer(map, targetLayer);
  }

  return targetLayer;
}

/**
 * Transition a layer to a polygon fill layer.
 *
 * @param map — The top-level MapLibre GL map instance.
 * @param layer — The CartoKit layer to transition.
 *
 * @returns — The transitioned CartoKitFillLayer.
 */
function transitionToFill(
  map: Map,
  layer: CartoKitLayer
): TransitionMapTypeReturnValue {
  const sourceLayerType = layer.type;

  switch (sourceLayerType) {
    case 'Choropleth': {
      const fill = randomColor();

      const targetLayer: CartoKitFillLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Fill',
        data: layer.data,
        style: {
          fill,
          opacity: layer.style.opacity
        }
      };

      // Just update the fill-color of the existing layer.
      map.setPaintProperty(layer.id, 'fill-color', fill);

      return {
        targetLayer,
        redraw: false
      };
    }
    case 'Proportional Symbol': {
      const rawFeatureCollectionType = getFeatureCollectionType(
        layer.data.rawGeoJSON
      );

      if (
        rawFeatureCollectionType !== 'Polygon' &&
        rawFeatureCollectionType !== 'MultiPolygon'
      ) {
        throw new Error(
          `Unsupported geometry transition. Transition initiated from ${rawFeatureCollectionType} to Polygon.`
        );
      }

      const targetLayer: CartoKitFillLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Fill',
        data: {
          ...layer.data,
          geoJSON: layer.data.rawGeoJSON
        },
        style: {
          fill: layer.style.fill,
          opacity: layer.style.opacity
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Dot Density': {
      const targetLayer: CartoKitFillLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Fill',
        data: {
          ...layer.data,
          geoJSON: layer.data.rawGeoJSON
        },
        style: {
          fill: layer.style.fill,
          opacity: layer.style.opacity
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Fill': {
      return {
        targetLayer: layer,
        redraw: false
      };
    }
  }
}

/**
 * Transition a layer to a choropleth layer.
 *
 * @param map — The top-level MapLibre GL map instance.
 * @param layer — The CartoKit layer to transition.
 *
 * @returns – The transitioned CartoKitChoroplethLayer.
 */
function transitionToChoropleth(
  map: Map,
  layer: CartoKitLayer
): TransitionMapTypeReturnValue {
  const sourceLayerType = layer.type;

  switch (sourceLayerType) {
    case 'Fill': {
      const targetLayer: CartoKitChoroplethLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Choropleth',
        data: layer.data,
        attribute: selectNumericAttribute(layer.data.geoJSON.features),
        style: {
          breaks: {
            scale: 'Quantile',
            colors: DEFAULT_PALETTE
          },
          opacity: layer.style.opacity
        }
      };

      // Just update the fill-color of the existing layer.
      map.setPaintProperty(
        layer.id,
        'fill-color',
        deriveColorScale(targetLayer)
      );

      return {
        targetLayer,
        redraw: false
      };
    }
    case 'Proportional Symbol': {
      const rawFeatureCollectionType = getFeatureCollectionType(
        layer.data.rawGeoJSON
      );

      if (
        rawFeatureCollectionType !== 'Polygon' &&
        rawFeatureCollectionType !== 'MultiPolygon'
      ) {
        throw new Error(
          `Unsupported geometry transition. Transition initiated from ${rawFeatureCollectionType} to Polygon.`
        );
      }

      const targetLayer: CartoKitChoroplethLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Choropleth',
        data: {
          ...layer.data,
          geoJSON: layer.data.rawGeoJSON
        },
        attribute: layer.attribute,
        style: {
          breaks: {
            scale: 'Quantile',
            colors: DEFAULT_PALETTE
          },
          opacity: layer.style.opacity
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Dot Density': {
      const targetLayer: CartoKitChoroplethLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Choropleth',
        data: {
          ...layer.data,
          geoJSON: layer.data.rawGeoJSON
        },
        attribute: layer.attribute,
        style: {
          breaks: {
            scale: 'Quantile',
            colors: DEFAULT_PALETTE
          },
          opacity: layer.style.opacity
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Choropleth': {
      return {
        targetLayer: layer,
        redraw: false
      };
    }
  }
}

/**
 * Transition a layer to a proportional symbol layer.
 *
 * @param layer — The CartoKit layer to transition.
 *
 * @returns – The transitioned CartoKitProportionalSymbolLayer.
 */
function transitionToProportionalSymbol(
  layer: CartoKitLayer
): TransitionMapTypeReturnValue {
  const sourceLayerType = layer.type;
  const features = layer.data.geoJSON.features;

  switch (sourceLayerType) {
    case 'Fill': {
      const targetLayer: CartoKitProportionalSymbolLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Proportional Symbol',
        data: {
          ...layer.data,
          geoJSON: deriveCentroids(features)
        },
        attribute: selectNumericAttribute(features),
        style: {
          size: {
            min: DEFAULT_MIN_SIZE,
            max: DEFAULT_MAX_SIZE
          },
          fill: layer.style.fill,
          opacity: layer.style.opacity
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Choropleth': {
      const targetLayer: CartoKitProportionalSymbolLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Proportional Symbol',
        data: {
          ...layer.data,
          geoJSON: deriveCentroids(features)
        },
        attribute: layer.attribute,
        style: {
          size: {
            min: DEFAULT_MIN_SIZE,
            max: DEFAULT_MAX_SIZE
          },
          fill: layer.style.breaks.colors[layer.style.breaks.colors.length - 1],
          opacity: layer.style.opacity
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Dot Density': {
      const targetLayer: CartoKitProportionalSymbolLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Proportional Symbol',
        data: {
          ...layer.data,
          geoJSON: deriveCentroids(layer.data.rawGeoJSON.features)
        },
        attribute: layer.attribute,
        style: {
          size: {
            min: DEFAULT_MIN_SIZE,
            max: DEFAULT_MAX_SIZE
          },
          fill: layer.style.fill,
          opacity: layer.style.opacity
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Proportional Symbol':
      return {
        targetLayer: layer,
        redraw: false
      };
  }
}

/**
 * Transition a layer to a dot density layer.
 *
 * @param layer — The CartoKit layer to transition.
 *
 * @returns – The transitioned CartoKitDotDensityLayer.
 */
function transitionToDotDensity(
  layer: CartoKitLayer
): TransitionMapTypeReturnValue {
  const sourceLayerType = layer.type;

  switch (sourceLayerType) {
    case 'Fill': {
      const features = layer.data.geoJSON.features;
      const attribute = selectNumericAttribute(features);
      const dotValue = deriveDotDensityStartingValue(features, attribute);

      const targetLayer: CartoKitDotDensityLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Dot Density',
        attribute,
        data: {
          ...layer.data,
          geoJSON: generateDotDensityPoints({
            features,
            attribute,
            value: dotValue
          })
        },
        style: {
          dots: {
            size: 1,
            value: dotValue
          },
          fill: layer.style.fill,
          opacity: layer.style.opacity
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Choropleth': {
      const features = layer.data.geoJSON.features;
      const dotValue = deriveDotDensityStartingValue(features, layer.attribute);

      const targetLayer: CartoKitDotDensityLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Dot Density',
        attribute: layer.attribute,
        data: {
          ...layer.data,
          geoJSON: generateDotDensityPoints({
            features,
            attribute: layer.attribute,
            value: dotValue
          })
        },
        style: {
          dots: {
            size: 1,
            value: dotValue
          },
          fill: randomColor(),
          opacity: layer.style.opacity
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Proportional Symbol': {
      const rawFeatureCollectionType = getFeatureCollectionType(
        layer.data.rawGeoJSON
      );

      if (
        rawFeatureCollectionType !== 'Polygon' &&
        rawFeatureCollectionType !== 'MultiPolygon'
      ) {
        throw new Error(
          `Unsupported geometry transition. Transition initiated from ${rawFeatureCollectionType} to Polygon.`
        );
      }

      const features = layer.data.rawGeoJSON.features;
      const dotValue = deriveDotDensityStartingValue(features, layer.attribute);

      const targetLayer: CartoKitDotDensityLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Dot Density',
        attribute: layer.attribute,
        data: {
          ...layer.data,
          geoJSON: generateDotDensityPoints({
            features,
            attribute: layer.attribute,
            value: dotValue
          })
        },
        style: {
          dots: {
            size: 1,
            value: dotValue
          },
          fill: layer.style.fill,
          opacity: layer.style.opacity
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Dot Density': {
      return {
        targetLayer: layer,
        redraw: false
      };
    }
  }
}
