import type maplibregl from 'maplibre-gl';
import { get } from 'svelte/store';

import { feature } from '$lib/state/feature.svelte';
import { layerId } from '$lib/state/layerId.svelte';
import { listeners } from '$lib/state/listeners.svelte';
import { layout } from '$lib/stores/layout';
import type { CartoKitLayer } from '$lib/types';
import { getCanonicalLayerId } from '$lib/utils/layer/id';

/**
 * Add a selection indicator to a feature in a point layer.
 *
 * @param map The top-level {@link maplibregl.Map} instance.
 * @param layerId The id of the layer to instrument.
 * @param sourceLayerId The id of the source layer to instrument. This is only
 * necessary for {@link CartoKitLayer}s with {@link CartoKitVectorSource}s.
 */
export function instrumentPointSelect(
  map: maplibregl.Map,
  layerId: string,
  sourceLayerId?: string
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

  addSelectListeners(map, layerId, sourceLayerId);
}

/**
 * Add a selection indicator to a feature in a line layer.
 *
 * @param map The top-level {@link maplibregl.Map} instance.
 * @param layerId The id of the layer to instrument.
 * @param sourceLayerId The id of the source layer to instrument. This is only
 * necessary for {@link CartoKitLayer}s with {@link CartoKitVectorSource}s.
 */
export function instrumentLineSelect(
  map: maplibregl.Map,
  layerId: string,
  sourceLayerId?: string
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

  addSelectListeners(map, layerId, sourceLayerId);
}

/**
 * Add a selection indicator to a feature in a polygon layer.
 *
 * @param map The top-level {@link maplibregl.Map} instance.
 * @param layerId The id of the layer to instrument.
 * @param sourceLayerId The id of the source layer to instrument. This is only
 * necessary for {@link CartoKitLayer}s with {@link CartoKitVectorSource}s.
 */
export function instrumentPolygonSelect(
  map: maplibregl.Map,
  layerId: string,
  sourceLayerId?: string
): void {
  map.addLayer({
    id: `${layerId}-select`,
    type: 'line',
    source: layerId,
    'source-layer': sourceLayerId,
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

  addSelectListeners(map, layerId, sourceLayerId);
}

/**
 * Wire up event listeners for select effects.
 *
 * @param map The top-level {@link maplibregl.Map} instance.
 * @param lyrId The id of the layer to add event listeners to.
 * @param sourceLayerId The id of the source layer to instrument. This is only
 * necessary for {@link CartoKitLayer}s with {@link CartoKitVectorSource}s.
 */
function addSelectListeners(
  map: maplibregl.Map,
  lyrId: string,
  sourceLayerId?: string
): void {
  let featureId: string | number | undefined;

  function onClick(event: maplibregl.MapLayerMouseEvent): void {
    if (event.features && event.features.length > 0) {
      if (featureId !== undefined) {
        map.setFeatureState(
          {
            source: lyrId,
            id: featureId,
            sourceLayer: sourceLayerId
          },
          { selected: false }
        );
      }

      const { id, type, properties, geometry } = event.features[0];

      if (id) {
        map.setFeatureState(
          {
            source: lyrId,
            id,
            sourceLayer: sourceLayerId
          },
          { selected: true }
        );
        featureId = id;
      }

      feature.value = {
        id,
        type,
        properties,
        geometry,
        layerId: lyrId,
        sourceLayerId
      };
      layerId.value = getCanonicalLayerId(lyrId);
    }
  }

  map.on('click', lyrId, onClick);

  const layerListeners = listeners.value.get(lyrId)!;

  listeners.value.set(lyrId, {
    ...layerListeners,
    click: onClick
  });
}

/**
 * A global event listener for deselecting features.
 *
 * @param map The top-level {@link maplibregl.Map} instance.
 * @param layers The current {@link CartoKitLayer}s on the map.
 * @returns A callback to run when a map mouse event intersects no features.
 */
export function onFeatureLeave(
  map: maplibregl.Map,
  layers: Record<string, CartoKitLayer>
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

    // If the mouse event intersects no features and there is a currently selected feature...
    if (features.length === 0) {
      if (typeof feature.value?.id !== 'undefined') {
        // Deselect the feature.
        map.removeFeatureState(
          {
            source: feature.value.layerId,
            id: feature.value.id,
            sourceLayer: feature.value.sourceLayerId
          },
          'selected'
        );
      }

      // Hide the DataTable if it's open.
      if (get(layout).dataVisible) {
        layout.update((layout) => {
          layout.dataVisible = false;

          return layout;
        });
      }

      // Clear the selected feature and layer.
      feature.value = null;
      layerId.value = null;
      // If the mouse event intersects features but the selected feature is different, deselect it.
    } else if (
      features.length > 0 &&
      feature.value &&
      features[0].id !== feature.value.id
    ) {
      map.removeFeatureState(
        {
          source: feature.value.layerId,
          id: feature.value.id,
          sourceLayer: feature.value.sourceLayerId
        },
        'selected'
      );
    }
  };
}
