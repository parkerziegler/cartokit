import type { Geometry, Feature, Polygon, MultiPolygon } from 'geojson';
import type { Map, GeoJSONSource } from 'maplibre-gl';

import { deriveColorScale } from '$lib/interaction/color';
import {
  generateDotDensityPoints,
  deriveDotDensityStartingValue,
  deriveCentroids,
  deriveSize
} from '$lib/interaction/geometry';
import { addLayer } from '$lib/interaction/layer';
import { listeners, type LayerListeners } from '$lib/stores/listeners';
import type {
  CartoKitLayer,
  CartoKitPointLayer,
  CartoKitProportionalSymbolLayer,
  CartoKitDotDensityLayer,
  CartoKitLineLayer,
  CartoKitFillLayer,
  CartoKitChoroplethLayer
} from '$lib/types/CartoKitLayer';
import type { MapType } from '$lib/types/map-types';
import { randomColor } from '$lib/utils/color';
import {
  DEFAULT_OPACITY,
  DEFAULT_MAX_SIZE,
  DEFAULT_MIN_SIZE,
  DEFAULT_COUNT,
  DEFAULT_SCALE,
  DEFAULT_SCHEME,
  DEFAULT_THRESHOLDS,
  DEFAULT_RADIUS,
  DEFAULT_STROKE,
  DEFAULT_STROKE_WIDTH
} from '$lib/utils/constants';
import {
  getLayerGeometryType,
  selectNumericAttribute
} from '$lib/utils/geojson';
import { getInstrumentedLayerIds } from '$lib/utils/layer';
import {
  transformDotDensity,
  transformGeometryToCentroids
} from '$lib/utils/transformation';

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
export const transitionMapType = ({
  map,
  layer,
  targetMapType
}: TransitionMapTypeParams): CartoKitLayer => {
  let redraw = false;
  let targetLayer: CartoKitLayer;

  switch (targetMapType) {
    case 'Point': {
      ({ redraw, targetLayer } = transitionToPoint(map, layer));
      break;
    }
    case 'Proportional Symbol': {
      ({ redraw, targetLayer } = transitionToProportionalSymbol(map, layer));
      break;
    }
    case 'Dot Density': {
      ({ redraw, targetLayer } = transitionToDotDensity(layer));
      break;
    }
    case 'Line': {
      ({ redraw, targetLayer } = transitionToLine(map, layer));
      break;
    }
    case 'Fill': {
      ({ redraw, targetLayer } = transitionToFill(map, layer));
      break;
    }
    case 'Choropleth': {
      ({ redraw, targetLayer } = transitionToChoropleth(map, layer));
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

    getInstrumentedLayerIds(layer).forEach((id) => {
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
};

/**
 * Generate errors with consistent messages for unsupported map type transitions.
 *
 * @param rawGeometryType – The geometry type of the original layer.
 * @param targetGeometryType – The geometry type of the target layer being
 * transitioned to.
 *
 * @returns – never—program execution halts.
 */
const generateUnsupportedTransitionError = (
  rawGeometryType: Geometry['type'],
  targetGeometryType: Geometry['type']
): Error => {
  throw new Error(
    `Unsupported geometry transition. Transition initiated from ${rawGeometryType} to ${targetGeometryType}, but no ${targetGeometryType} features are present in the original data.`
  );
};

/**
 * Transition a layer to a point layer.
 *
 * @param map — The top-level MapLibre GL map instance.
 * @param layer — The CartoKit layer to transition.
 *
 * @returns — The transitioned CartoKitPointLayer.
 */
const transitionToPoint = (
  map: Map,
  layer: CartoKitLayer
): TransitionMapTypeReturnValue => {
  switch (layer.type) {
    case 'Point':
      return {
        targetLayer: layer,
        redraw: false
      };
    case 'Proportional Symbol': {
      const targetLayer: CartoKitPointLayer = {
        ...layer,
        type: 'Point',
        style: {
          ...layer.style,
          size: DEFAULT_RADIUS
        }
      };

      // Update the circle-radius of the existing layer. All other paint
      // properties should remain unchanged.
      map.setPaintProperty(layer.id, 'circle-radius', DEFAULT_RADIUS);

      return {
        targetLayer,
        redraw: false
      };
    }
    case 'Dot Density': {
      const targetLayer: CartoKitPointLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Point',
        data: {
          ...layer.data,
          geoJSON: deriveCentroids(layer.data.rawGeoJSON.features),
          transformations: [
            ...layer.data.transformations,
            transformGeometryToCentroids()
          ]
        },
        style: {
          ...layer.style,
          size: layer.style.dots.size
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Line': {
      const targetLayer: CartoKitPointLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Point',
        data: {
          ...layer.data,
          geoJSON: deriveCentroids(layer.data.geoJSON.features),
          transformations: [
            ...layer.data.transformations,
            transformGeometryToCentroids()
          ]
        },
        style: {
          size: DEFAULT_RADIUS,
          fill: {
            color: randomColor(),
            opacity: DEFAULT_OPACITY
          },
          stroke: layer.style.stroke
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Fill': {
      const targetLayer: CartoKitPointLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Point',
        data: {
          ...layer.data,
          geoJSON: deriveCentroids(layer.data.geoJSON.features),
          transformations: [
            ...layer.data.transformations,
            transformGeometryToCentroids()
          ]
        },
        style: {
          size: DEFAULT_RADIUS,
          fill: layer.style.fill,
          stroke: layer.style.stroke
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Choropleth': {
      const targetLayer: CartoKitPointLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Point',
        data: {
          ...layer.data,
          geoJSON: deriveCentroids(layer.data.geoJSON.features),
          transformations: [
            ...layer.data.transformations,
            transformGeometryToCentroids()
          ]
        },
        style: {
          size: DEFAULT_RADIUS,
          fill: {
            color:
              layer.style.fill.scheme[layer.style.fill.count].at(-1) ??
              randomColor(),
            opacity: layer.style.fill.opacity
          },
          stroke: layer.style.stroke
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
  }
};

/**
 * Transition a layer to a proportional symbol layer.
 *
 * @param layer — The CartoKit layer to transition.
 *
 * @returns – The transitioned CartoKitProportionalSymbolLayer.
 */
const transitionToProportionalSymbol = (
  map: Map,
  layer: CartoKitLayer
): TransitionMapTypeReturnValue => {
  const features = layer.data.geoJSON.features;

  switch (layer.type) {
    case 'Point': {
      const targetLayer: CartoKitProportionalSymbolLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Proportional Symbol',
        data: layer.data,
        style: {
          size: {
            attribute: selectNumericAttribute(features),
            min: DEFAULT_MIN_SIZE,
            max: DEFAULT_MAX_SIZE
          },
          fill: layer.style.fill,
          stroke: layer.style.stroke
        }
      };

      // Update the circle-radius of the existing layer. All other paint
      // properties should remain unchanged.
      map.setPaintProperty(layer.id, 'circle-radius', deriveSize(targetLayer));

      return {
        targetLayer,
        redraw: false
      };
    }
    case 'Proportional Symbol':
      return {
        targetLayer: layer,
        redraw: false
      };
    case 'Dot Density': {
      const targetLayer: CartoKitProportionalSymbolLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Proportional Symbol',
        data: {
          ...layer.data,
          geoJSON: deriveCentroids(layer.data.rawGeoJSON.features),
          transformations: [
            ...layer.data.transformations,
            transformGeometryToCentroids()
          ]
        },
        style: {
          size: {
            attribute: layer.style.dots.attribute,
            min: DEFAULT_MIN_SIZE,
            max: DEFAULT_MAX_SIZE
          },
          fill: layer.style.fill,
          stroke: layer.style.stroke
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Line': {
      const targetLayer: CartoKitProportionalSymbolLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Proportional Symbol',
        data: {
          ...layer.data,
          geoJSON: deriveCentroids(features),
          transformations: [
            ...layer.data.transformations,
            transformGeometryToCentroids()
          ]
        },
        style: {
          size: {
            attribute: selectNumericAttribute(features),
            min: DEFAULT_MIN_SIZE,
            max: DEFAULT_MAX_SIZE
          },
          fill: {
            color: randomColor(),
            opacity: DEFAULT_OPACITY
          },
          stroke: layer.style.stroke
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Fill': {
      const targetLayer: CartoKitProportionalSymbolLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Proportional Symbol',
        data: {
          ...layer.data,
          geoJSON: deriveCentroids(features),
          transformations: [
            ...layer.data.transformations,
            transformGeometryToCentroids()
          ]
        },
        style: {
          size: {
            attribute: selectNumericAttribute(features),
            min: DEFAULT_MIN_SIZE,
            max: DEFAULT_MAX_SIZE
          },
          fill: layer.style.fill,
          stroke: layer.style.stroke
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
          geoJSON: deriveCentroids(features),
          transformations: [
            ...layer.data.transformations,
            transformGeometryToCentroids()
          ]
        },
        style: {
          size: {
            attribute: layer.style.fill.attribute,
            min: DEFAULT_MIN_SIZE,
            max: DEFAULT_MAX_SIZE
          },
          fill: {
            color:
              layer.style.fill.scheme[layer.style.fill.count].at(-1) ??
              randomColor(),
            opacity: layer.style.fill.opacity
          },
          stroke: layer.style.stroke
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
  }
};

/**
 * Transition a layer to a dot density layer.
 *
 * @param layer — The CartoKit layer to transition.
 *
 * @returns – The transitioned CartoKitDotDensityLayer.
 */
const transitionToDotDensity = (
  layer: CartoKitLayer
): TransitionMapTypeReturnValue => {
  switch (layer.type) {
    case 'Point': {
      const rawGeometryType = getLayerGeometryType(layer.data.rawGeoJSON);

      if (rawGeometryType !== 'Polygon' && rawGeometryType !== 'MultiPolygon') {
        generateUnsupportedTransitionError(rawGeometryType, 'Polygon');
      }

      const features = layer.data.rawGeoJSON.features as Feature<
        Polygon | MultiPolygon
      >[];
      const attribute = selectNumericAttribute(features);
      const dotValue = deriveDotDensityStartingValue(features, attribute);

      const targetLayer: CartoKitDotDensityLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Dot Density',
        data: {
          ...layer.data,
          geoJSON: generateDotDensityPoints({
            features,
            attribute,
            value: dotValue
          }),
          transformations: [
            ...layer.data.transformations,
            transformDotDensity(attribute, dotValue)
          ]
        },
        style: {
          dots: {
            attribute,
            size: 1,
            value: dotValue
          },
          fill: layer.style.fill,
          stroke: layer.style.stroke
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Proportional Symbol': {
      const rawGeometryType = getLayerGeometryType(layer.data.rawGeoJSON);

      if (rawGeometryType !== 'Polygon' && rawGeometryType !== 'MultiPolygon') {
        generateUnsupportedTransitionError(rawGeometryType, 'Polygon');
      }

      const features = layer.data.rawGeoJSON.features as Feature<
        Polygon | MultiPolygon
      >[];
      const attribute = layer.style.size.attribute;
      const dotValue = deriveDotDensityStartingValue(
        features,
        layer.style.size.attribute
      );

      const targetLayer: CartoKitDotDensityLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Dot Density',
        data: {
          ...layer.data,
          geoJSON: generateDotDensityPoints({
            features,
            attribute,
            value: dotValue
          }),
          transformations: [
            ...layer.data.transformations,
            transformDotDensity(attribute, dotValue)
          ]
        },
        style: {
          dots: {
            attribute,
            size: 1,
            value: dotValue
          },
          fill: layer.style.fill,
          stroke: layer.style.stroke
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Dot Density':
      return {
        targetLayer: layer,
        redraw: false
      };
    case 'Line': {
      const rawGeometryType = getLayerGeometryType(layer.data.rawGeoJSON);
      const error = generateUnsupportedTransitionError(
        rawGeometryType,
        'Polygon'
      );

      throw error;
    }
    case 'Fill': {
      const features = layer.data.geoJSON.features as Feature<
        Polygon | MultiPolygon
      >[];
      const attribute = selectNumericAttribute(features);
      const dotValue = deriveDotDensityStartingValue(features, attribute);

      const targetLayer: CartoKitDotDensityLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Dot Density',
        data: {
          ...layer.data,
          geoJSON: generateDotDensityPoints({
            features,
            attribute,
            value: dotValue
          }),
          transformations: [
            ...layer.data.transformations,
            transformDotDensity(attribute, dotValue)
          ]
        },
        style: {
          dots: {
            attribute,
            size: 1,
            value: dotValue
          },
          fill: layer.style.fill,
          stroke: layer.style.stroke
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Choropleth': {
      const features = layer.data.geoJSON.features as Feature<
        Polygon | MultiPolygon
      >[];
      const attribute = layer.style.fill.attribute;
      const dotValue = deriveDotDensityStartingValue(features, attribute);

      const targetLayer: CartoKitDotDensityLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Dot Density',
        data: {
          ...layer.data,
          geoJSON: generateDotDensityPoints({
            features,
            attribute,
            value: dotValue
          }),
          transformations: [
            ...layer.data.transformations,
            transformDotDensity(attribute, dotValue)
          ]
        },
        style: {
          dots: {
            attribute,
            size: 1,
            value: dotValue
          },
          fill: {
            color:
              layer.style.fill.scheme[layer.style.fill.count].at(-1) ??
              randomColor(),
            opacity: layer.style.fill.opacity
          },
          stroke: layer.style.stroke
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
  }
};

/**
 * Transition a layer to a line layer.
 *
 * @param map – The top-level MapLibre GL map instance.
 * @param layer – The CartoKit layer to transition.
 *
 * @returns – The transitioned CartoKitLineLayer.
 */
const transitionToLine = (
  _map: Map,
  layer: CartoKitLayer
): TransitionMapTypeReturnValue => {
  switch (layer.type) {
    case 'Line':
      return {
        targetLayer: layer,
        redraw: false
      };
    case 'Point':
    case 'Proportional Symbol': {
      const rawGeometryType = getLayerGeometryType(layer.data.rawGeoJSON);

      if (
        rawGeometryType !== 'LineString' &&
        rawGeometryType !== 'MultiLineString'
      ) {
        const error = generateUnsupportedTransitionError(
          rawGeometryType,
          'LineString'
        );
        throw error;
      }

      const targetLayer: CartoKitLineLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Line',
        data: {
          ...layer.data,
          geoJSON: layer.data.rawGeoJSON
        },
        style: {
          stroke: layer.style.stroke ?? {
            color: DEFAULT_STROKE,
            width: DEFAULT_STROKE_WIDTH,
            opacity: DEFAULT_OPACITY
          }
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Dot Density':
    case 'Fill':
    case 'Choropleth': {
      const geometryType = getLayerGeometryType(layer.data.geoJSON);
      const error = generateUnsupportedTransitionError(
        geometryType,
        'LineString'
      );

      throw error;
    }
  }
};

/**
 * Transition a layer to a polygon fill layer.
 *
 * @param map — The top-level MapLibre GL map instance.
 * @param layer — The CartoKit layer to transition.
 *
 * @returns — The transitioned CartoKitFillLayer.
 */
const transitionToFill = (
  map: Map,
  layer: CartoKitLayer
): TransitionMapTypeReturnValue => {
  switch (layer.type) {
    case 'Point': {
      const rawGeometryType = getLayerGeometryType(layer.data.rawGeoJSON);

      if (rawGeometryType !== 'Polygon' && rawGeometryType !== 'MultiPolygon') {
        generateUnsupportedTransitionError(rawGeometryType, 'Polygon');
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
          stroke: layer.style.stroke
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Proportional Symbol': {
      const rawGeometryType = getLayerGeometryType(layer.data.rawGeoJSON);

      if (rawGeometryType !== 'Polygon' && rawGeometryType !== 'MultiPolygon') {
        generateUnsupportedTransitionError(rawGeometryType, 'Polygon');
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
          stroke: layer.style.stroke
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
          stroke: layer.style.stroke
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Line': {
      const rawGeometryType = getLayerGeometryType(layer.data.rawGeoJSON);
      const error = generateUnsupportedTransitionError(
        rawGeometryType,
        'Polygon'
      );

      throw error;
    }
    case 'Fill':
      return {
        targetLayer: layer,
        redraw: false
      };
    case 'Choropleth': {
      const colors = layer.style.fill.scheme[layer.style.fill.count];
      const color = colors.at(-1) ?? randomColor();

      const targetLayer: CartoKitFillLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Fill',
        data: layer.data,
        style: {
          fill: {
            color,
            opacity: layer.style.fill.opacity
          },
          stroke: layer.style.stroke
        }
      };

      // Update the fill-color of the existing layer. All other paint properties
      // should remain unchanged.
      map.setPaintProperty(layer.id, 'fill-color', color);

      return {
        targetLayer,
        redraw: false
      };
    }
  }
};

/**
 * Transition a layer to a choropleth layer.
 *
 * @param map — The top-level MapLibre GL map instance.
 * @param layer — The CartoKit layer to transition.
 *
 * @returns – The transitioned CartoKitChoroplethLayer.
 */
const transitionToChoropleth = (
  map: Map,
  layer: CartoKitLayer
): TransitionMapTypeReturnValue => {
  switch (layer.type) {
    case 'Point': {
      const rawGeometryType = getLayerGeometryType(layer.data.rawGeoJSON);

      if (rawGeometryType !== 'Polygon' && rawGeometryType !== 'MultiPolygon') {
        generateUnsupportedTransitionError(rawGeometryType, 'Polygon');
      }

      const attribute = selectNumericAttribute(layer.data.geoJSON.features);

      const targetLayer: CartoKitChoroplethLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Choropleth',
        data: {
          ...layer.data,
          geoJSON: layer.data.rawGeoJSON
        },
        style: {
          fill: {
            attribute,
            scale: DEFAULT_SCALE,
            scheme: DEFAULT_SCHEME,
            count: DEFAULT_COUNT,
            thresholds: DEFAULT_THRESHOLDS(
              attribute,
              layer.data.geoJSON.features
            ),
            opacity: layer.style.fill?.opacity ?? DEFAULT_OPACITY
          },
          stroke: layer.style.stroke
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Proportional Symbol': {
      const rawGeometryType = getLayerGeometryType(layer.data.rawGeoJSON);

      if (rawGeometryType !== 'Polygon' && rawGeometryType !== 'MultiPolygon') {
        generateUnsupportedTransitionError(rawGeometryType, 'Polygon');
      }

      const targetLayer: CartoKitChoroplethLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Choropleth',
        data: {
          ...layer.data,
          geoJSON: layer.data.rawGeoJSON
        },
        style: {
          fill: {
            attribute: layer.style.size.attribute,
            scale: DEFAULT_SCALE,
            scheme: DEFAULT_SCHEME,
            count: DEFAULT_COUNT,
            thresholds: DEFAULT_THRESHOLDS(
              layer.style.size.attribute,
              layer.data.geoJSON.features
            ),
            opacity: layer.style.fill?.opacity ?? DEFAULT_OPACITY
          },
          stroke: layer.style.stroke
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
        style: {
          fill: {
            attribute: layer.style.dots.attribute,
            scale: DEFAULT_SCALE,
            scheme: DEFAULT_SCHEME,
            count: DEFAULT_COUNT,
            thresholds: DEFAULT_THRESHOLDS(
              layer.style.dots.attribute,
              layer.data.geoJSON.features
            ),
            opacity: layer.style.fill?.opacity ?? DEFAULT_OPACITY
          },
          stroke: layer.style.stroke
        }
      };

      return {
        targetLayer,
        redraw: true
      };
    }
    case 'Line': {
      const rawGeometryType = getLayerGeometryType(layer.data.rawGeoJSON);
      const error = generateUnsupportedTransitionError(
        rawGeometryType,
        'Polygon'
      );

      throw error;
    }
    case 'Fill': {
      const attribute = selectNumericAttribute(layer.data.geoJSON.features);

      const targetLayer: CartoKitChoroplethLayer = {
        id: layer.id,
        displayName: layer.displayName,
        type: 'Choropleth',
        data: layer.data,
        style: {
          fill: {
            attribute,
            scale: DEFAULT_SCALE,
            scheme: DEFAULT_SCHEME,
            count: DEFAULT_COUNT,
            thresholds: DEFAULT_THRESHOLDS(
              attribute,
              layer.data.geoJSON.features
            ),
            opacity: layer.style.fill?.opacity ?? DEFAULT_OPACITY
          },
          stroke: layer.style.stroke
        }
      };

      // Set the fill-color of polygons based on the choropleth color scale.
      map.setPaintProperty(
        layer.id,
        'fill-color',
        deriveColorScale(targetLayer)
      );

      // If the Fill layer we're transitioning from had no fill, set the opacity
      // to the default to ensure the fill is visible.
      if (!layer.style.fill?.opacity) {
        map.setPaintProperty(layer.id, 'fill-opacity', DEFAULT_OPACITY);
      }

      return {
        targetLayer,
        redraw: false
      };
    }
    case 'Choropleth': {
      return {
        targetLayer: layer,
        redraw: false
      };
    }
  }
};
