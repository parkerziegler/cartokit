import type { Map } from 'maplibre-gl';

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

/**
 * Add a CartoKit layer to the map.
 *
 * @param map – The top-level MapLibre GL map instance.
 * @param layer – The CartoKit layer to add to the map.
 */
export function addLayer(map: Map, layer: CartoKitLayer): void {
  switch (layer.type) {
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
