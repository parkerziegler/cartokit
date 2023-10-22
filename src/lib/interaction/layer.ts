import type { Map } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import uniqueId from 'lodash.uniqueid';
import kebabCase from 'lodash.kebabcase';

import { deriveColorScale } from '$lib/interaction/color';
import { deriveSize } from '$lib/interaction/geometry';
import {
  instrumentPolygonHover,
  instrumentPointHover
} from '$lib/interaction/hover';
import {
  instrumentPolygonSelect,
  instrumentPointSelect
} from '$lib/interaction/select';
import type { CartoKitLayer } from '$lib/types/CartoKitLayer';
import { randomColor } from '$lib/utils/color';
import {
  DEFAULT_OPACITY,
  DEFAULT_RADIUS,
  DEFAULT_STROKE_OPACITY,
  DEFAULT_STROKE_WIDTH
} from '$lib/utils/constants';
import { getLayerGeometryType } from '$lib/utils/geojson';

/**
 * Add a CartoKit layer to the map.
 *
 * @param map – The top-level MapLibre GL map instance.
 * @param layer – The CartoKit layer to add to the map.
 */
export function addLayer(map: Map, layer: CartoKitLayer): void {
  switch (layer.type) {
    case 'Point': {
      const fillProperties = layer.style.fill
        ? {
            'circle-color': layer.style.fill.color,
            'circle-opacity': layer.style.fill.opacity
          }
        : {};
      const strokeProperties = layer.style.stroke
        ? {
            'circle-stroke-color': layer.style.stroke.color,
            'circle-stroke-width': layer.style.stroke.width,
            'circle-stroke-opacity': layer.style.stroke.opacity
          }
        : {};

      map.addLayer({
        id: layer.id,
        source: layer.id,
        type: 'circle',
        paint: {
          ...fillProperties,
          ...strokeProperties,
          'circle-radius': layer.style.size
        }
      });

      instrumentPointHover(map, layer.id);
      instrumentPointSelect(map, layer.id);
      break;
    }
    case 'Fill': {
      if (layer.style.fill) {
        map.addLayer({
          id: layer.id,
          source: layer.id,
          type: 'fill',
          paint: {
            'fill-color': layer.style.fill.color,
            'fill-opacity': layer.style.fill.opacity
          }
        });
      }

      // Add a separate layer for the stroke, if a stroke exists.
      if (layer.style.stroke) {
        map.addLayer({
          id: `${layer.id}-stroke`,
          source: layer.id,
          type: 'line',
          paint: {
            'line-color': layer.style.stroke.color,
            'line-width': layer.style.stroke.width,
            'line-opacity': layer.style.stroke.opacity
          }
        });
      }

      instrumentPolygonHover(map, layer.id);
      instrumentPolygonSelect(map, layer.id);
      break;
    }
    case 'Choropleth': {
      map.addLayer({
        id: layer.id,
        source: layer.id,
        type: 'fill',
        paint: {
          'fill-color': deriveColorScale(layer),
          'fill-opacity': layer.style.fill.opacity
        }
      });

      // Add a separate layer for the stroke.
      if (layer.style.stroke) {
        map.addLayer({
          id: `${layer.id}-stroke`,
          source: layer.id,
          type: 'line',
          paint: {
            'line-color': layer.style.stroke.color,
            'line-width': layer.style.stroke.width,
            'line-opacity': layer.style.stroke.opacity
          }
        });
      }

      instrumentPolygonHover(map, layer.id);
      instrumentPolygonSelect(map, layer.id);
      break;
    }
    case 'Proportional Symbol': {
      const fillProperties = layer.style.fill
        ? {
            'circle-color': layer.style.fill.color,
            'circle-opacity': layer.style.fill.opacity
          }
        : {};
      const strokeProperties = layer.style.stroke
        ? {
            'circle-stroke-color': layer.style.stroke.color,
            'circle-stroke-width': layer.style.stroke.width,
            'circle-stroke-opacity': layer.style.stroke.opacity
          }
        : {};

      map.addLayer({
        id: layer.id,
        source: layer.id,
        type: 'circle',
        paint: {
          ...fillProperties,
          ...strokeProperties,
          'circle-radius': deriveSize(layer)
        }
      });

      instrumentPointHover(map, layer.id);
      instrumentPointSelect(map, layer.id);
      break;
    }
    case 'Dot Density': {
      // Add a separate source for the polygon outlines of the dot density layer.
      // Ensure it does not already exist from a previous transition before adding it.
      if (!map.getSource(`${layer.id}-outlines`)) {
        map.addSource(`${layer.id}-outlines`, {
          type: 'geojson',
          data: layer.data.rawGeoJSON
        });
      }

      // Add a transparent layer to the map for the outlines.
      // This is the layer we'll instrument for hover and select effects.
      map.addLayer({
        id: `${layer.id}-outlines`,
        type: 'fill',
        source: `${layer.id}-outlines`,
        paint: {
          'fill-color': 'transparent',
          'fill-opacity': 0
        }
      });

      // Add the dot density layer to the map.
      const fillProperties = layer.style.fill
        ? {
            'circle-color': layer.style.fill.color,
            'circle-opacity': layer.style.fill.opacity
          }
        : {};
      const strokeProperties = layer.style.stroke
        ? {
            'circle-stroke-color': layer.style.stroke.color,
            'circle-stroke-width': layer.style.stroke.width,
            'circle-stroke-opacity': layer.style.stroke.opacity
          }
        : {};

      map.addLayer({
        id: layer.id,
        source: layer.id,
        type: 'circle',
        paint: {
          ...fillProperties,
          ...strokeProperties,
          'circle-radius': layer.style.dots.size
        }
      });

      instrumentPolygonHover(map, `${layer.id}-outlines`);
      instrumentPolygonSelect(map, `${layer.id}-outlines`);
      break;
    }
  }
}

/**
 * Generate a CartoKitLayer for a given GeoJSON dataset, using the dataset's
 * Geometry type to select the appropriate member from the CartoKitLayer union.
 *
 * @param featureCollection – The GeoJSON FeatureCollection associated with the
 * layer.
 * @returns – A default CartoKitLayer appropriate for the input geometry type.
 */
export const generateCartoKitLayer = (
  featureCollection: FeatureCollection,
  options: { displayName: string; url?: string; fileName?: string }
): CartoKitLayer => {
  const geometryType = getLayerGeometryType(featureCollection);
  const color = randomColor();

  switch (geometryType) {
    case 'Point':
    case 'MultiPoint':
      return {
        id: uniqueId(`${kebabCase(options.displayName)}__`),
        displayName: options.displayName,
        type: 'Point',
        data: {
          geoJSON: featureCollection,
          rawGeoJSON: featureCollection,
          fileName: options.fileName,
          url: options.url,
          transformations: []
        },
        style: {
          size: DEFAULT_RADIUS,
          fill: {
            color,
            opacity: DEFAULT_OPACITY
          },
          stroke: {
            color,
            width: DEFAULT_STROKE_WIDTH,
            opacity: DEFAULT_STROKE_OPACITY
          }
        }
      };
    case 'Polygon':
    case 'MultiPolygon':
      return {
        id: uniqueId(`${kebabCase(options.displayName)}__`),
        displayName: options.displayName,
        type: 'Fill',
        data: {
          geoJSON: featureCollection,
          rawGeoJSON: featureCollection,
          fileName: options.fileName,
          url: options.url,
          transformations: []
        },
        style: {
          fill: {
            color,
            opacity: DEFAULT_OPACITY
          },
          stroke: {
            color,
            width: DEFAULT_STROKE_WIDTH,
            opacity: DEFAULT_STROKE_OPACITY
          }
        }
      };
    default:
      throw new Error(`Unsupported geometry type: ${geometryType}.`);
  }
};
