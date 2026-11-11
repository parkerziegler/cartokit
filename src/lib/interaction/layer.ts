import type { Map } from 'maplibre-gl';
import { get } from 'svelte/store';

import { deriveColorRamp, deriveColorScale } from '$lib/interaction/color';
import {
  instrumentLineHover,
  instrumentLineSelect,
  instrumentPointHover,
  instrumentPointSelect,
  instrumentPolygonHover,
  instrumentPolygonSelect
} from '$lib/interaction/events';
import { deriveSize } from '$lib/interaction/geometry';
import { catalog } from '$lib/state/catalog.svelte';
import { ir } from '$lib/stores/ir';
import type { CartoKitLayer } from '$lib/types';
import type { CartoKitSource } from '$lib/types/source';
import { randomColor } from '$lib/utils/color';
import {
  DEFAULT_OPACITY,
  DEFAULT_SIZE,
  DEFAULT_STROKE_OPACITY,
  DEFAULT_STROKE_WIDTH
} from '$lib/utils/constants';
import { getAffiliatedLayerIds } from '$lib/utils/layer';

/**
 * Generate a {@link CartoKitLayer} for a given {@link CartoKitSource}.
 *
 * @param source The {@link CartoKitSource} associated with the layer.
 * @param layerId The fresh ID of the {@link CartoKitLayer}.
 * @param displayName The display name of the {@link CartoKitLayer}.
 * @returns A default {@link CartoKitLayer} for the input source.
 */
export function generateCartoKitLayer(
  source: CartoKitSource,
  layerId: string,
  displayName: string
): CartoKitLayer {
  const { geometryType } = catalog.value[layerId];
  const color = randomColor();
  const z = Object.values(get(ir).layers).length;

  switch (geometryType) {
    case 'Point':
    case 'MultiPoint':
      return {
        id: layerId,
        displayName: displayName,
        type: 'Point',
        source,
        style: {
          size: DEFAULT_SIZE,
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
          deleted: false,
          visible: true,
          z,
          tooltip: {
            visible: true
          }
        }
      };
    case 'Line':
    case 'LineString':
    case 'MultiLineString':
      return {
        id: layerId,
        displayName: displayName,
        type: 'Line',
        source,
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
          deleted: false,
          visible: true,
          z,
          tooltip: {
            visible: true
          }
        }
      };
    case 'Polygon':
    case 'MultiPolygon':
      return {
        id: layerId,
        displayName: displayName,
        type: 'Polygon',
        source,
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
          deleted: false,
          visible: true,
          z,
          tooltip: {
            visible: true
          }
        }
      };
    case 'GeometryCollection':
      throw new Error('GeometryCollection not supported.');
  }
}

/**
 * Get the id of the map layer a {@link CartoKitLayer} should be added before,
 * so that it is drawn according to its z-index.
 *
 * @param map The top-level {@link Map} instance.
 * @param layer The {@link CartoKitLayer} being added to the map.
 * @returns The id of the layer to insert before, if any.
 */
function getBeforeId(map: Map, layer: CartoKitLayer): string | undefined {
  const { layers, basemap } = get(ir);
  const layersAbove = Object.values(layers)
    .filter(
      ({ id, layout }) =>
        id !== layer.id && !layout.deleted && layout.z > layer.layout.z
    )
    .sort((a, b) => a.layout.z - b.layout.z);

  for (const { id } of layersAbove) {
    const [bottomLayerId] = getAffiliatedLayerIds(map, id);

    if (bottomLayerId) {
      return bottomLayerId;
    }
  }

  return basemap.beforeId;
}

/**
 * Add a {@link CartoKitLayer} to the map at its z-index, hidden if the layer is
 * not visible. Layers drawn above all other layers are added beneath the labels
 * of the active basemap.
 *
 * @param map The top-level {@link Map} instance.
 * @param layer The {@link CartoKitLayer} to add to the map.
 */
export function addLayer(map: Map, layer: CartoKitLayer): void {
  const sourceLayer =
    layer.source.type === 'pmtiles' ? layer.source.sourceLayerId : undefined;
  const beforeId = getBeforeId(map, layer);

  switch (layer.type) {
    case 'Choropleth': {
      map.addLayer(
        {
          id: layer.id,
          source: layer.id,
          'source-layer': sourceLayer,
          type: 'fill',
          paint: {
            'fill-color': deriveColorScale(layer.style.fill, layer.id),
            'fill-opacity': layer.style.fill.opacity
          }
        },
        beforeId
      );

      const strokePaint = layer.style.stroke.visible
        ? {
            'line-color': layer.style.stroke.color,
            'line-width': layer.style.stroke.width,
            'line-opacity': layer.style.stroke.opacity
          }
        : {
            'line-color': 'transparent',
            'line-width': 0,
            'line-opacity': 0
          };

      map.addLayer(
        {
          id: `${layer.id}-stroke`,
          source: layer.id,
          'source-layer': sourceLayer,
          type: 'line',
          paint: strokePaint
        },
        beforeId
      );

      instrumentPolygonHover(map, layer.id, sourceLayer);
      instrumentPolygonSelect(map, layer.id, sourceLayer);
      break;
    }
    case 'Heatmap': {
      // Add a transparent layer to the map for the points.
      // This is the layer we'll instrument for hover and select effects.
      map.addLayer(
        {
          id: `${layer.id}-points`,
          source: layer.id,
          'source-layer': sourceLayer,
          type: 'circle',
          paint: {
            'circle-color': 'transparent',
            'circle-opacity': 0
          }
        },
        beforeId
      );

      // Add the heatmap layer to the map.
      map.addLayer(
        {
          id: layer.id,
          source: layer.id,
          'source-layer': sourceLayer,
          type: 'heatmap',
          paint: {
            'heatmap-color': deriveColorRamp(layer.style.heatmap),
            'heatmap-opacity': layer.style.heatmap.opacity,
            'heatmap-radius': layer.style.heatmap.radius
          }
        },
        beforeId
      );

      instrumentPointHover(map, `${layer.id}-points`, sourceLayer);
      instrumentPointSelect(map, `${layer.id}-points`, sourceLayer);
      break;
    }
    case 'Line': {
      map.addLayer(
        {
          id: layer.id,
          source: layer.id,
          'source-layer': sourceLayer,
          type: 'line',
          paint: {
            'line-color': layer.style.stroke.color,
            'line-width': layer.style.stroke.width,
            'line-opacity': layer.style.stroke.opacity
          }
        },
        beforeId
      );

      instrumentLineHover(map, layer.id, sourceLayer);
      instrumentLineSelect(map, layer.id, sourceLayer);
      break;
    }
    case 'Point': {
      const fillPaint = layer.style.fill.visible
        ? {
            'circle-color': deriveColorScale(layer.style.fill, layer.id),
            'circle-opacity': layer.style.fill.opacity
          }
        : {
            'circle-color': 'transparent',
            'circle-opacity': 0
          };

      const strokePaint = layer.style.stroke.visible
        ? {
            'circle-stroke-color': layer.style.stroke.color,
            'circle-stroke-width': layer.style.stroke.width,
            'circle-stroke-opacity': layer.style.stroke.opacity
          }
        : {
            'circle-stroke-color': 'transparent',
            'circle-stroke-width': 0,
            'circle-stroke-opacity': 0
          };

      map.addLayer(
        {
          id: layer.id,
          source: layer.id,
          'source-layer': sourceLayer,
          type: 'circle',
          paint: {
            ...fillPaint,
            ...strokePaint,
            'circle-radius': layer.style.size
          }
        },
        beforeId
      );

      instrumentPointHover(map, layer.id, sourceLayer);
      instrumentPointSelect(map, layer.id, sourceLayer);
      break;
    }
    case 'Polygon': {
      const fillPaint = layer.style.fill.visible
        ? {
            'fill-color': layer.style.fill.color,
            'fill-opacity': layer.style.fill.opacity
          }
        : {
            'fill-color': 'transparent',
            'fill-opacity': 0
          };

      map.addLayer(
        {
          id: layer.id,
          source: layer.id,
          'source-layer': sourceLayer,
          type: 'fill',
          paint: fillPaint
        },
        beforeId
      );

      const strokePaint = layer.style.stroke.visible
        ? {
            'line-color': layer.style.stroke.color,
            'line-width': layer.style.stroke.width,
            'line-opacity': layer.style.stroke.opacity
          }
        : {
            'line-color': 'transparent',
            'line-width': 0,
            'line-opacity': 0
          };

      // Add a separate layer for the stroke.
      map.addLayer(
        {
          id: `${layer.id}-stroke`,
          source: layer.id,
          'source-layer': sourceLayer,
          type: 'line',
          paint: strokePaint
        },
        beforeId
      );

      instrumentPolygonHover(map, layer.id, sourceLayer);
      instrumentPolygonSelect(map, layer.id, sourceLayer);
      break;
    }
    case 'Proportional Symbol': {
      const fillPaint = layer.style.fill.visible
        ? {
            'circle-color': deriveColorScale(layer.style.fill, layer.id),
            'circle-opacity': layer.style.fill.opacity
          }
        : {
            'circle-color': 'transparent',
            'circle-opacity': 0
          };

      const strokePaint = layer.style.stroke.visible
        ? {
            'circle-stroke-color': layer.style.stroke.color,
            'circle-stroke-width': layer.style.stroke.width,
            'circle-stroke-opacity': layer.style.stroke.opacity
          }
        : {
            'circle-stroke-color': 'transparent',
            'circle-stroke-width': 0,
            'circle-stroke-opacity': 0
          };

      map.addLayer(
        {
          id: layer.id,
          source: layer.id,
          'source-layer': sourceLayer,
          type: 'circle',
          paint: {
            ...fillPaint,
            ...strokePaint,
            'circle-radius': deriveSize(layer.id, layer.style.size)
          }
        },
        beforeId
      );

      instrumentPointHover(map, layer.id, sourceLayer);
      instrumentPointSelect(map, layer.id, sourceLayer);
      break;
    }
  }
}
