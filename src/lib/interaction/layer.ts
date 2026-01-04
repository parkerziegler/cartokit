import type { Map } from 'maplibre-gl';

import { deriveColorRamp, deriveColorScale } from '$lib/interaction/color';
import { deriveSize } from '$lib/interaction/geometry';
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
import type { CartoKitLayer } from '$lib/types';

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

      instrumentPolygonHover(map, layer.id);
      instrumentPolygonSelect(map, layer.id);
      break;
    }
    case 'Dot Density': {
      // Add a separate source for the polygon outlines of the dot density layer.
      // Ensure it does not already exist from a previous transition before adding it.
      if (!map.getSource(`${layer.id}-outlines`)) {
        map.addSource(`${layer.id}-outlines`, {
          type: 'geojson',
          data: layer.data.sourceGeojson,
          generateId: true
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
      map.addLayer({
        id: layer.id,
        source: layer.id,
        type: 'circle',
        paint: {
          'circle-color': layer.style.fill.color,
          'circle-opacity': layer.style.fill.opacity,
          'circle-stroke-color': layer.style.stroke.color,
          'circle-stroke-width': layer.style.stroke.width,
          'circle-stroke-opacity': layer.style.stroke.opacity,
          'circle-radius': layer.style.size
        }
      });

      instrumentPolygonHover(map, `${layer.id}-outlines`);
      instrumentPolygonSelect(map, `${layer.id}-outlines`);
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

      // Add a transparent layer to the map for the points.
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
      map.addLayer({
        id: layer.id,
        source: layer.id,
        type: 'circle',
        paint: {
          'circle-color': deriveColorScale(layer.style.fill),
          'circle-opacity': layer.style.fill.opacity,
          'circle-stroke-color': layer.style.stroke.color,
          'circle-stroke-width': layer.style.stroke.width,
          'circle-stroke-opacity': layer.style.stroke.opacity,
          'circle-radius': layer.style.size
        }
      });

      instrumentPointHover(map, layer.id);
      instrumentPointSelect(map, layer.id);
      break;
    }
    case 'Polygon': {
      map.addLayer({
        id: layer.id,
        source: layer.id,
        type: 'fill',
        paint: {
          'fill-color': layer.style.fill.color,
          'fill-opacity': layer.style.fill.opacity
        }
      });

      // Add a separate layer for the stroke.
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

      instrumentPolygonHover(map, layer.id);
      instrumentPolygonSelect(map, layer.id);
      break;
    }
    case 'Proportional Symbol': {
      map.addLayer({
        id: layer.id,
        source: layer.id,
        type: 'circle',
        paint: {
          'circle-color': deriveColorScale(layer.style.fill),
          'circle-opacity': layer.style.fill.opacity,
          'circle-stroke-color': layer.style.stroke.color,
          'circle-stroke-width': layer.style.stroke.width,
          'circle-stroke-opacity': layer.style.stroke.opacity,
          'circle-radius': deriveSize(layer)
        }
      });

      instrumentPointHover(map, layer.id);
      instrumentPointSelect(map, layer.id);
      break;
    }
  }
}
