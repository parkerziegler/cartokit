import type { FeatureCollection } from 'geojson';
import { kebabCase, uniqueId } from 'lodash-es';
import type { Map } from 'maplibre-gl';

import { deriveColorRamp, deriveColorScale } from '$lib/interaction/color';
import { deriveRadius } from '$lib/interaction/geometry';
import {
  instrumentPointHover,
  instrumentLineHover,
  instrumentPolygonHover
} from '$lib/interaction/hover';
import {
  instrumentPointSelect,
  instrumentLineSelect,
  instrumentPolygonSelect
} from '$lib/interaction/select';
import { ir } from '$lib/state/ir.svelte';
import type { CartoKitLayer } from '$lib/types';
import { randomColor } from '$lib/utils/color';
import {
  DEFAULT_OPACITY,
  DEFAULT_RADIUS,
  DEFAULT_STROKE_OPACITY,
  DEFAULT_STROKE_WIDTH
} from '$lib/utils/constants';
import { getFeatureCollectionGeometryType } from '$lib/utils/geojson';

/**
 * Add a @see{CartoKitLayer} to the map.
 *
 * @param {Map} map – The top-level MapLibre GL map instance.
 * @param {CartoKitLayer} layer – The @see{CartoKitLayer} to add to the map.
 */
export function addLayer(map: Map, layer: CartoKitLayer): void {
  switch (layer.type) {
    case 'Choropleth': {
      map.addLayer({
        id: layer.id,
        source: layer.id,
        type: 'fill',
        paint: {
          'fill-color': deriveColorScale(layer.style.fill),
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
    case 'Heatmap': {
      // Add a separate source for the point outlines of the heatmap layer.
      // Ensure it does not already exist from a previous transition before adding it.
      if (!map.getSource(`${layer.id}-points`)) {
        map.addSource(`${layer.id}-points`, {
          type: 'geojson',
          data: layer.data.sourceGeojson,
          generateId: true
        });
      }

      // Add a transparent layer to the map for the outlines.
      // This is the layer we'll instrument for hover and select effects.
      map.addLayer({
        id: `${layer.id}-points`,
        type: 'circle',
        source: `${layer.id}-points`,
        paint: {
          'circle-color': 'transparent',
          'circle-opacity': 0
        }
      });

      // Add the heatmap layer to the map.
      map.addLayer({
        id: layer.id,
        source: layer.id,
        type: 'heatmap',
        paint: {
          'heatmap-color': deriveColorRamp(layer.style.heatmap),
          'heatmap-opacity': layer.style.heatmap.opacity,
          'heatmap-radius': layer.style.heatmap.radius
        }
      });

      instrumentPointHover(map, `${layer.id}-points`);
      instrumentPointSelect(map, `${layer.id}-points`);
      break;
    }
    case 'Line': {
      map.addLayer({
        id: layer.id,
        source: layer.id,
        type: 'line',
        paint: {
          'line-color': layer.style.stroke.color,
          'line-width': layer.style.stroke.width,
          'line-opacity': layer.style.stroke.opacity
        }
      });

      instrumentLineHover(map, layer.id);
      instrumentLineSelect(map, layer.id);
      break;
    }
    case 'Point': {
      const fillProperties = layer.style.fill
        ? {
            'circle-color': deriveColorScale(layer.style.fill),
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
    case 'Polygon': {
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
    case 'Proportional Symbol': {
      const fillProperties = layer.style.fill
        ? {
            'circle-color': deriveColorScale(layer.style.fill),
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
          'circle-radius': deriveRadius(layer)
        }
      });

      instrumentPointHover(map, layer.id);
      instrumentPointSelect(map, layer.id);
      break;
    }
  }
}

/**
 * Generate a CartoKitLayer for a given GeoJSON dataset, using the dataset's
 * Geometry type to select the appropriate member from the CartoKitLayer union.
 *
 * @param {FeatureCollection} featureCollection – The GeoJSON FeatureCollection
 * associated with the layer.
 * @returns – A default CartoKitLayer appropriate for the input geometry type.
 */
export function generateCartoKitLayer(
  featureCollection: FeatureCollection,
  options: { displayName: string; url?: string; fileName?: string }
): CartoKitLayer {
  const geometryType = getFeatureCollectionGeometryType(featureCollection);
  const color = randomColor();

  switch (geometryType) {
    case 'Point':
    case 'MultiPoint':
      return {
        id: uniqueId(`${kebabCase(options.displayName)}__`),
        displayName: options.displayName,
        type: 'Point',
        data: {
          geojson: featureCollection,
          sourceGeojson: featureCollection,
          fileName: options.fileName,
          url: options.url,
          transformations: []
        },
        style: {
          size: DEFAULT_RADIUS,
          fill: {
            type: 'Constant',
            color,
            opacity: DEFAULT_OPACITY,
            visible: true
          },
          stroke: {
            type: 'Constant',
            color,
            width: DEFAULT_STROKE_WIDTH,
            opacity: DEFAULT_STROKE_OPACITY,
            visible: true
          }
        },
        layout: {
          visibility: 'visible',
          z: Object.values(ir.value.layers).length,
          tooltip: {
            visible: true
          }
        }
      };
    case 'LineString':
    case 'MultiLineString':
      return {
        id: uniqueId(`${kebabCase(options.displayName)}__`),
        displayName: options.displayName,
        type: 'Line',
        data: {
          geojson: featureCollection,
          sourceGeojson: featureCollection,
          fileName: options.fileName,
          url: options.url,
          transformations: []
        },
        style: {
          stroke: {
            type: 'Constant',
            color,
            width: DEFAULT_STROKE_WIDTH,
            opacity: DEFAULT_STROKE_OPACITY,
            visible: true
          }
        },
        layout: {
          visibility: 'visible',
          z: Object.values(ir.value.layers).length,
          tooltip: {
            visible: true
          }
        }
      };
    case 'Polygon':
    case 'MultiPolygon':
      return {
        id: uniqueId(`${kebabCase(options.displayName)}__`),
        displayName: options.displayName,
        type: 'Polygon',
        data: {
          geojson: featureCollection,
          sourceGeojson: featureCollection,
          fileName: options.fileName,
          url: options.url,
          transformations: []
        },
        style: {
          fill: {
            type: 'Constant',
            color,
            opacity: DEFAULT_OPACITY,
            visible: true
          },
          stroke: {
            type: 'Constant',
            color,
            width: DEFAULT_STROKE_WIDTH,
            opacity: DEFAULT_STROKE_OPACITY,
            visible: true
          }
        },
        layout: {
          visibility: 'visible',
          z: Object.values(ir.value.layers).length,
          tooltip: {
            visible: true
          }
        }
      };
    case 'GeometryCollection':
      throw new Error('GeometryCollection not supported.');
  }
}
