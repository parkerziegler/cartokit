import type maplibregl from 'maplibre-gl';
import { get } from 'svelte/store';

import { feature } from '$lib/state/feature.svelte';
import { listeners } from '$lib/state/listeners.svelte';
import { layout } from '$lib/stores/layout';
import type { CartoKitIR } from '$lib/types';

/**
 * Add a selection indicator to a feature in a point layer.
 *
 * @param map The top-level {@link maplibregl.Map} instance.
 * @param layerId The id of the layer to instrument.
 */
export function instrumentPointSelect(
  map: maplibregl.Map,
  layerId: string
): void {
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
 * Add a selection indicator to a feature in a line layer.
 *
 * @param map The top-level {@link maplibregl.Map} instance.
 * @param layerId The id of the layer to instrument.
 */
export function instrumentLineSelect(
  map: maplibregl.Map,
  layerId: string
): void {
  const currentStrokeWidth = map.getPaintProperty(layerId, 'line-width');
  const currentStrokeColor = map.getPaintProperty(layerId, 'line-color');

  map.setPaintProperty(layerId, 'line-width', [
    'case',
    ['boolean', ['feature-state', 'selected'], false],
    1,
    currentStrokeWidth ?? 0
  ]);
  map.setPaintProperty(layerId, 'line-color', [
    'case',
    ['boolean', ['feature-state', 'selected'], false],
    '#A534FF',
    currentStrokeColor ?? 'transparent'
  ]);

  addSelectListeners(map, layerId);
}

/**
 * Add a selection indicator to a feature in a polygon layer.
 *
 * @param map The top-level {@link maplibregl.Map} instance.
 * @param layerId The id of the layer to instrument.
 */
export function instrumentPolygonSelect(
  map: maplibregl.Map,
  layerId: string
): void {
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
 * Wire up event listeners for select effects.
 *
 * @param map The top-level {@link maplibregl.Map} instance.
 * @param layerId The id of the layer to add event listeners to.
 */
function addSelectListeners(map: maplibregl.Map, layerId: string): void {
  let selectedFeatureId: string | null = null;

  function onClick(event: maplibregl.MapLayerMouseEvent): void {
    if (event.features && event.features.length > 0) {
      if (selectedFeatureId !== null) {
        map.setFeatureState(
          { source: layerId, id: selectedFeatureId },
          { selected: false }
        );
      }

      // We forcibly assign an "id" property to all GeoJSON sources using generateId:
      // https://maplibre.org/maplibre-gl-js-docs/style-spec/sources/#geojson-generateId
      selectedFeatureId = event.features[0].id!.toString();
      map.setFeatureState(
        { source: layerId, id: selectedFeatureId },
        { selected: true }
      );

      feature.value = event.features[0];
    }
  }

  map.on('click', layerId, onClick);

  const layerListeners = listeners.value.get(layerId)!;

  listeners.value.set(layerId, {
    ...layerListeners,
    click: onClick
  });
}

/**
 * A global event listener for deselecting features.
 *
 * @param map The top-level {@link maplibregl.Map} instance.
 * @param ir The {@link CartoKitIR}.
 * @returns A callback to run when a map mouse event intersects no features.
 */
export function onFeatureLeave(
  map: maplibregl.Map,
  { layers }: CartoKitIR
): (event: maplibregl.MapMouseEvent) => void {
  return (event: maplibregl.MapMouseEvent): void => {
    const layerIds = Object.values(layers).map((layer) => {
      // For dot density layers, we need to deselect the outlines layer.
      if (layer.type === 'Dot Density') {
        return `${layer.id}-outlines`;
      }

      // For heatmap layers, we need to deselect the points layer.
      if (layer.type === 'Heatmap') {
        return `${layer.id}-points`;
      }

      return layer.id;
    });

    const features = map.queryRenderedFeatures(event.point, {
      layers: layerIds
    });

    // If the mouse event intersects no features and there is a currently selected feature, deselect it.
    if (features.length === 0 && typeof feature.value?.id !== 'undefined') {
      if (get(layout).dataVisible) {
        layout.update((layout) => {
          layout.dataVisible = false;

          return layout;
        });
      }

      map.removeFeatureState(
        { source: feature.value.layer.id, id: feature.value.id },
        'selected'
      );

      feature.value = null;
      // If the mouse event intersects features but the selected feature is different, deselect it.
    } else if (
      features.length > 0 &&
      feature.value &&
      features[0].id !== feature.value.id
    ) {
      map.removeFeatureState(
        { source: feature.value.layer.id, id: feature.value.id },
        'selected'
      );
    }
  };
}
