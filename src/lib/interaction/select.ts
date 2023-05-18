import type {
  Map,
  MapGeoJSONFeature,
  MapLayerMouseEvent,
  MapMouseEvent
} from 'maplibre-gl';
import { get } from 'svelte/store';

import type { CartoKitIR } from '$lib/stores/ir';
import { listeners } from '$lib/stores/listeners';
import { selectedFeature } from '$lib/stores/selected-feature';

/**
 * Add a selection indicator to a feature in a polygon layer.
 *
 * @param map – The top-level MapLibre GL map instance.
 * @param layerId — The id of the layer to instrument.
 */
export function instrumentPolygonSelect(map: Map, layerId: string): void {
  map.addLayer({
    id: `${layerId}-select`,
    type: 'line',
    source: layerId,
    paint: {
      'line-color': '#A534FF',
      'line-width': [
        'case',
        ['boolean', ['feature-state', 'selected'], false],
        1,
        0
      ]
    }
  });

  addSelectListeners(map, layerId);
}

/**
 * Add a selection indicator to a feature in a point layer.
 *
 * @param map – The top-level MapLibre GL map instance.
 * @param layerId – The id of the layer to instrument.
 */
export function instrumentPointSelect(map: Map, layerId: string): void {
  const currentStrokeWidth = map.getPaintProperty(
    layerId,
    'circle-stroke-width'
  );
  const currentStrokeColor = map.getPaintProperty(
    layerId,
    'circle-stroke-color'
  );

  map.setPaintProperty(layerId, 'circle-stroke-width', [
    'case',
    ['boolean', ['feature-state', 'selected'], false],
    1,
    currentStrokeWidth ?? 0
  ]);
  map.setPaintProperty(layerId, 'circle-stroke-color', [
    'case',
    ['boolean', ['feature-state', 'selected'], false],
    '#A534FF',
    currentStrokeColor ?? 'transparent'
  ]);

  addSelectListeners(map, layerId);
}

/**
 * Wire up event listeners for select effects.
 *
 * @param map – The top-level MapLibre GL map instance.
 * @param layerId – The id of the layer to instrument.
 */
function addSelectListeners(map: Map, layerId: string) {
  let selectedFeatureId: string | null = null;

  function onClick(event: MapLayerMouseEvent): void {
    if (event.features && event.features.length > 0) {
      if (selectedFeatureId !== null) {
        map.setFeatureState(
          { source: layerId, id: selectedFeatureId },
          { selected: false }
        );
      }

      // We forcibly assign an "id" property to all GeoJSON sources using generateId:
      // https://maplibre.org/maplibre-gl-js-docs/style-spec/sources/#geojson-generateId
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      selectedFeatureId = event.features[0].id!.toString();
      map.setFeatureState(
        { source: layerId, id: selectedFeatureId },
        { selected: true }
      );

      // We cast for now until this PR is released: https://github.com/maplibre/maplibre-gl-js/pull/2244
      selectedFeature.set(event.features[0] as MapGeoJSONFeature);
    }
  }

  map.on('click', layerId, onClick);

  listeners.update((ls) => {
    const layerListeners = ls.get(layerId) ?? {
      /* eslint-disable @typescript-eslint/no-empty-function */
      click: () => {},
      mousemove: () => {},
      mouseleave: () => {}
      /* eslint-enable @typescript-eslint/no-empty-function */
    };

    return ls.set(layerId, {
      ...layerListeners,
      click: onClick
    });
  });
}

/**
 * A global event listener for deselecting features.
 *
 * @param map – The top-level MapLibre GL map instance.
 * @param ir – The CartoKit IR.
 * @returns – deselectFeature, a callback to run when a map mouse event intersects no features.
 */
export function onFeatureLeave(
  map: Map,
  { layers }: CartoKitIR
): (event: MapMouseEvent) => void {
  return function deselectFeature(event: MapMouseEvent) {
    const layerIds = Object.values(layers).map((layer) => {
      // For dot density layers, we need to deselect the outline layer.
      if (layer.type === 'Dot Density') {
        return `${layer.id}-outlines`;
      }

      return layer.id;
    });

    const features = map.queryRenderedFeatures(event.point, {
      layers: layerIds
    });
    const selFeature = get(selectedFeature);

    // If the mouse event intersects no features and there is a currently selected feature, deselect it.
    if (features.length === 0 && typeof selFeature?.id !== 'undefined') {
      selectedFeature.set(null);

      map.removeFeatureState(
        { source: selFeature.layer.id, id: selFeature.id },
        'selected'
      );
      // If the mouse event intersects features but the selected feature is different, deselect it.
    } else if (
      features.length > 0 &&
      selFeature &&
      features[0].id !== selFeature.id
    ) {
      map.removeFeatureState(
        { source: selFeature.layer.id, id: selFeature.id },
        'selected'
      );
    }
  };
}
