import type { Map, GeoJSONSource } from 'maplibre-gl';

import { addLayer } from '$lib/interaction/layer';
import type { CartoKitLayer, LayerType } from '$lib/types';
import { listeners, type LayerListeners } from '$lib/stores/listeners';
import { getInstrumentedLayerIds } from '$lib/utils/layer';

import { transitionToChoropleth } from '$lib/interaction/layer-type/choropleth';
import { transitionToDotDensity } from '$lib/interaction/layer-type/dot-density';
import { transitionToHeatmap } from '$lib/interaction/layer-type/heatmap';
import { transitionToLine } from '$lib/interaction/layer-type/line';
import { transitionToPoint } from '$lib/interaction/layer-type/point';
import { transitionToPolygon } from '$lib/interaction/layer-type/polygon';
import { transitionToProportionalSymbol } from '$lib/interaction/layer-type/proportional-symbol';

/**
 * Transition a layer from one layer type to another. For cross-geometry trans-
 * itions, this will create a new layer and remove the previous layer.
 *
 * @param {Map} map — The top-level MapLibre GL map instance.
 * @param {CartoKitLayer} layer — The CartoKitLayer to transition.
 * @param {string} targetLayerType — The layer type to transition to.
 * @returns — The transitioned CartoKitLayer.
 */
export function transitionLayerType(
  map: Map,
  layer: CartoKitLayer,
  targetLayerType: LayerType
): CartoKitLayer {
  let redraw = false;
  let targetLayer: CartoKitLayer;

  switch (targetLayerType) {
    case 'Choropleth': {
      ({ redraw, targetLayer } = transitionToChoropleth(map, layer));
      break;
    }
    case 'Dot Density': {
      ({ redraw, targetLayer } = transitionToDotDensity(layer));
      break;
    }
    case 'Heatmap': {
      ({ redraw, targetLayer } = transitionToHeatmap(layer));
      break;
    }
    case 'Line': {
      ({ redraw, targetLayer } = transitionToLine(layer));
      break;
    }
    case 'Point': {
      ({ redraw, targetLayer } = transitionToPoint(map, layer));
      break;
    }
    case 'Polygon': {
      ({ redraw, targetLayer } = transitionToPolygon(map, layer));
      break;
    }
    case 'Proportional Symbol': {
      ({ redraw, targetLayer } = transitionToProportionalSymbol(map, layer));
      break;
    }
  }

  if (redraw) {
    // Remove all event listeners for the existing layer.
    listeners.update((ls) => {
      if (ls.has(layer.id)) {
        // This is a safe non-null assertion — we know the listeners exist via the call to .has.
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
      targetLayer.data.geojson
    );

    // Add the new layer. This function call includes instrumentation.
    addLayer(map, targetLayer);
  }

  return targetLayer;
}
