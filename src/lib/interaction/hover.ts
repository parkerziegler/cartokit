import type { Map, MapLayerMouseEvent } from 'maplibre-gl';
import { get } from 'svelte/store';

import { listeners } from '#lib/state/listeners.svelte.ts';
import { popup } from '#lib/state/popup.svelte.ts';
import { ir } from '#lib/stores/ir.ts';
import { getCanonicalLayerId, getSourceId } from '#lib/utils/layer.ts';
import { DEFAULT_HOVER_COLOR } from '#lib/utils/constants.ts';

/**
 * Add a hover effect to all features in a point layer.
 *
 * @param map The top-level {@link Map} instance.
 * @param layerId The id of the layer to instrument.
 * @param sourceLayerId The id of the source layer to instrument. This is only
 * necessary for {@link CartoKitLayer}s with {@link CartoKitPMTilesSource}s.
 */
export function instrumentPointHover(
  map: Map,
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
    ['number', 1],
    ['number', currentStrokeWidth ?? 0]
  ]);
  map.setPaintProperty(layerId, 'circle-stroke-color', [
    'case',
    ['boolean', ['feature-state', 'hover'], false],
    ['string', DEFAULT_HOVER_COLOR],
    ['string', currentStrokeColor ?? 'transparent']
  ]);

  addHoverListeners(map, layerId, sourceLayerId);
}

/**
 * Add a hover effect to all features in a line layer.
 *
 * @param map The top-level {@link Map} instance.
 * @param layerId The id of the layer to instrument.
 * @param sourceLayerId The id of the source layer to instrument. This is only
 * necessary for {@link CartoKitLayer}s with {@link CartoKitPMTilesSource}s.
 */
export function instrumentLineHover(
  map: Map,
  layerId: string,
  sourceLayerId?: string
): void {
  const currentStrokeWidth = map.getPaintProperty(layerId, 'line-width');
  const currentStrokeColor = map.getPaintProperty(layerId, 'line-color');

  map.setPaintProperty(layerId, 'line-width', [
    'case',
    ['boolean', ['feature-state', 'hover'], false],
    ['number', 1],
    ['number', currentStrokeWidth ?? 0]
  ]);
  map.setPaintProperty(layerId, 'line-color', [
    'case',
    ['boolean', ['feature-state', 'hover'], false],
    ['string', DEFAULT_HOVER_COLOR],
    ['string', currentStrokeColor ?? 'transparent']
  ]);

  addHoverListeners(map, layerId, sourceLayerId);
}

/**
 * Add a hover effect to all features in a polygon layer.
 *
 * @param map The top-level {@link Map} instance.
 * @param layerId The id of the layer to instrument.
 * @param sourceLayerId The id of the source layer to instrument. This is only
 * necessary for {@link CartoKitLayer}s with {@link CartoKitPMTilesSource}s.
 */
export function instrumentPolygonHover(
  map: Map,
  layerId: string,
  sourceLayerId?: string
): void {
  map.addLayer({
    id: `${layerId}-hover`,
    type: 'line',
    source: getSourceId(map, layerId),
    'source-layer': sourceLayerId,
    paint: {
      'line-color': DEFAULT_HOVER_COLOR,
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
 * @param map The top-level {@link Map} instance.
 * @param layerId The id of the layer to add event listeners to.
 * @param sourceLayerId The id of the source layer to instrument. This is only
 * necessary for {@link CartoKitLayer}s with {@link CartoKitPMTilesSource}s.
 */
function addHoverListeners(
  map: Map,
  layerId: string,
  sourceLayerId?: string
): void {
  let hoveredFeatureId: string | null = null;
  const canonicalLayerId = getCanonicalLayerId(layerId);
  const sourceId = getSourceId(map, layerId);

  function onMouseMove(event: MapLayerMouseEvent): void {
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
