import type maplibregl from 'maplibre-gl';
import { get } from 'svelte/store';

import { popup } from '$lib/state/popup.svelte';
import { ir } from '$lib/stores/ir';
import { listeners } from '$lib/state/listeners.svelte';

/**
 * Add a hover effect to all features in a point layer.
 *
 * @param map The top-level {@link maplibregl.Map} instance.
 * @param layerId The id of the layer to instrument.
 */
export function instrumentPointHover(
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

  addHoverListeners(map, layerId);
}

/**
 * Add a hover effect to all features in a line layer.
 *
 * @param map The top-level {@link maplibregl.Map} instance.
 * @param layerId The id of the layer to instrument.
 */
export function instrumentLineHover(
  map: maplibregl.Map,
  layerId: string
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

  addHoverListeners(map, layerId);
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
    source: layerId,
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
  const canonicalLayerId = layerId.replace(/-outlines|-points/g, '');

  function onMouseMove(event: maplibregl.MapLayerMouseEvent): void {
    if (event.features && event.features.length > 0) {
      if (hoveredFeatureId !== null) {
        map.setFeatureState(
          { source: layerId, id: hoveredFeatureId, sourceLayer: sourceLayerId },
          { hover: false }
        );
      }

      hoveredFeatureId = event.features[0].id?.toString() ?? null;

      if (hoveredFeatureId) {
        map.setFeatureState(
          { source: layerId, id: hoveredFeatureId, sourceLayer: sourceLayerId },
          { hover: true }
        );
        map.getCanvas().style.cursor = 'pointer';

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
  }

  function onMouseLeave(): void {
    if (hoveredFeatureId !== null) {
      map.setFeatureState(
        { source: layerId, id: hoveredFeatureId, sourceLayer: sourceLayerId },
        { hover: false }
      );
      map.getCanvas().style.cursor = '';

      popup[canonicalLayerId] = {
        open: false,
        displayName: '',
        properties: {}
      };
    }

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
