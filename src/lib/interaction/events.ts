import type maplibregl from 'maplibre-gl';
import { get } from 'svelte/store';

import { feature } from '$lib/state/feature.svelte';
import { layerId } from '$lib/state/layerId.svelte';
import { listeners, type LayerListeners } from '$lib/state/listeners.svelte';
import { popup } from '$lib/state/popup.svelte';
import { ir } from '$lib/stores/ir';
import { layout } from '$lib/stores/layout';
import type { CartoKitLayer } from '$lib/types';
import { getCanonicalLayerId, getSourceId } from '$lib/utils/layer/id';

/**
 * Add a hover effect to all features in a point layer.
 *
 * @param map The top-level {@link maplibregl.Map} instance.
 * @param layerId The id of the layer to instrument.
 * @param sourceLayerId The id of the source layer to instrument. This is only
 * necessary for {@link CartoKitLayer}s with {@link CartoKitVectorSource}s.
 */
export function instrumentPointHover(
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
    ['boolean', ['feature-state', 'hover'], false],
    1,
    currentStrokeWidth ?? 0
  ]);
  map.setPaintProperty(layerId, 'circle-stroke-color', [
    'case',
    ['boolean', ['feature-state', 'hover'], false],
    '#FFFFFF',
    currentStrokeColor ?? 'transparent'
  ]);

  addHoverListeners(map, layerId, sourceLayerId);
}

/**
 * Add a hover effect to all features in a line layer.
 *
 * @param map The top-level {@link maplibregl.Map} instance.
 * @param layerId The id of the layer to instrument.
 * @param sourceLayerId The id of the source layer to instrument. This is only
 * necessary for {@link CartoKitLayer}s with {@link CartoKitVectorSource}s.
 */
export function instrumentLineHover(
  map: maplibregl.Map,
  layerId: string,
  sourceLayerId?: string
): void {
  const currentStrokeWidth = map.getPaintProperty(layerId, 'line-width');
  const currentStrokeColor = map.getPaintProperty(layerId, 'line-color');

  map.setPaintProperty(layerId, 'line-width', [
    'case',
    ['boolean', ['feature-state', 'hover'], false],
    1,
    currentStrokeWidth ?? 0
  ]);
  map.setPaintProperty(layerId, 'line-color', [
    'case',
    ['boolean', ['feature-state', 'hover'], false],
    '#FFFFFF',
    currentStrokeColor ?? 'transparent'
  ]);

  addHoverListeners(map, layerId, sourceLayerId);
}

/**
 * Add a hover effect to all features in a polygon layer.
 *
 * @param map The top-level {@link maplibregl.Map} instance.
 * @param layerId The id of the layer to instrument.
 * @param sourceLayerId The id of the source layer to instrument. This is only
 * necessary for {@link CartoKitLayer}s with {@link CartoKitVectorSource}s.
 */
export function instrumentPolygonHover(
  map: maplibregl.Map,
  layerId: string,
  sourceLayerId?: string
): void {
  map.addLayer({
    id: `${layerId}-hover`,
    type: 'line',
    source: getSourceId(map, layerId),
    'source-layer': sourceLayerId,
    paint: {
      'line-color': '#FFFFFF',
      'line-width': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        1,
        0
      ]
    }
  });

  addHoverListeners(map, layerId, sourceLayerId);
}

/**
 * Wire up event listeners for hover effects.
 *
 * @param map The top-level {@link maplibregl.Map} instance.
 * @param layerId The id of the layer to add event listeners to.
 * @param sourceLayerId The id of the source layer to instrument. This is only
 * necessary for {@link CartoKitLayer}s with {@link CartoKitVectorSource}s.
 */
function addHoverListeners(
  map: maplibregl.Map,
  layerId: string,
  sourceLayerId?: string
): void {
  let hoveredFeatureId: string | null = null;
  const canonicalLayerId = getCanonicalLayerId(layerId);
  console.log({ layerId, canonicalLayerId });
  const sourceId = getSourceId(map, layerId);

  function onMouseMove(event: maplibregl.MapLayerMouseEvent): void {
    if (event.features && event.features.length > 0) {
      if (hoveredFeatureId !== null) {
        map.setFeatureState(
          {
            source: sourceId,
            id: hoveredFeatureId,
            sourceLayer: sourceLayerId
          },
          { hover: false }
        );
      }

      hoveredFeatureId = event.features[0].id?.toString() ?? null;

      if (hoveredFeatureId) {
        map.setFeatureState(
          {
            source: sourceId,
            id: hoveredFeatureId,
            sourceLayer: sourceLayerId
          },
          { hover: true }
        );
        map.getCanvas().style.cursor = 'pointer';
      }

      const currentIR = get(ir);

      if (currentIR.layers[canonicalLayerId].layout.tooltip.visible) {
        popup[canonicalLayerId] = {
          open: true,
          displayName: currentIR.layers[canonicalLayerId].displayName,
          properties: event.features[0].properties
        };
      }
    }
  }

  function onMouseLeave(): void {
    if (hoveredFeatureId !== null) {
      map.setFeatureState(
        {
          source: sourceId,
          id: hoveredFeatureId,
          sourceLayer: sourceLayerId
        },
        { hover: false }
      );
      map.getCanvas().style.cursor = '';
    }

    popup[canonicalLayerId] = {
      open: false,
      displayName: '',
      properties: {}
    };

    hoveredFeatureId = null;
  }

  map.on('mousemove', layerId, onMouseMove);
  map.on('mouseleave', layerId, onMouseLeave);

  const layerListeners = listeners.value.get(layerId)!;

  listeners.value.set(layerId, {
    ...layerListeners,
    mousemove: onMouseMove,
    mouseleave: onMouseLeave
  });
}

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
    source: getSourceId(map, layerId),
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
  const sourceId = getSourceId(map, lyrId);

  function onClick(event: maplibregl.MapLayerMouseEvent): void {
    if (event.features && event.features.length > 0) {
      if (featureId !== undefined) {
        map.setFeatureState(
          {
            source: sourceId,
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
            source: sourceId,
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
        sourceId,
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
            source: feature.value.sourceId,
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
          source: feature.value.sourceId,
          id: feature.value.id,
          sourceLayer: feature.value.sourceLayerId
        },
        'selected'
      );
    }
  };
}

/**
 * Detach the event listeners registered for a set of layers.
 *
 * @param map The top-level {@link maplibregl.Map} instance.
 * @param layerIds The ids of the layers to detach listeners from.
 */
export function removeLayerListeners(
  map: maplibregl.Map,
  layerIds: string[]
): void {
  layerIds.forEach((layerId) => {
    const layerListeners = listeners.value.get(layerId);

    if (!layerListeners) {
      return;
    }

    Object.entries(layerListeners).forEach(([event, listener]) => {
      map.off(event as keyof LayerListeners, layerId, listener);
    });

    listeners.value.delete(layerId);
  });
}
