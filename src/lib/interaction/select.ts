import type { Map, MapLayerMouseEvent, MapMouseEvent } from 'maplibre-gl';
import { get } from 'svelte/store';

import { contextMenu } from '#lib/state/context-menu.svelte.ts';
import { feature } from '#lib/state/feature.svelte.ts';
import { layerId } from '#lib/state/layerId.svelte.ts';
import { listeners } from '#lib/state/listeners.svelte.ts';
import { layout } from '#lib/stores/layout.ts';
import type { CartoKitLayer } from '#lib/types/index.ts';
import { DEFAULT_SELECTION_COLOR } from '#lib/utils/constants.ts';
import {
  getCanonicalLayerId,
  getInstrumentedLayerId,
  getSourceId
} from '#lib/utils/layer.ts';

/**
 * Add a selection indicator to a feature in a point layer.
 *
 * @param map The top-level {@link Map} instance.
 * @param layerId The id of the layer to instrument.
 * @param sourceLayerId The id of the source layer to instrument. This is only
 * necessary for {@link CartoKitLayer}s with {@link CartoKitPMTilesSource}s.
 */
export function instrumentPointSelect(
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
    ['boolean', ['feature-state', 'selected'], false],
    ['number', 1],
    ['number', currentStrokeWidth ?? 0]
  ]);
  map.setPaintProperty(layerId, 'circle-stroke-color', [
    'case',
    ['boolean', ['feature-state', 'selected'], false],
    ['string', DEFAULT_SELECTION_COLOR],
    ['string', currentStrokeColor ?? 'transparent']
  ]);

  addSelectListeners(map, layerId, sourceLayerId);
}

/**
 * Add a selection indicator to a feature in a line layer.
 *
 * @param map The top-level {@link Map} instance.
 * @param layerId The id of the layer to instrument.
 * @param sourceLayerId The id of the source layer to instrument. This is only
 * necessary for {@link CartoKitLayer}s with {@link CartoKitPMTilesSource}s.
 */
export function instrumentLineSelect(
  map: Map,
  layerId: string,
  sourceLayerId?: string
): void {
  const currentStrokeWidth = map.getPaintProperty(layerId, 'line-width');
  const currentStrokeColor = map.getPaintProperty(layerId, 'line-color');

  map.setPaintProperty(layerId, 'line-width', [
    'case',
    ['boolean', ['feature-state', 'selected'], false],
    ['number', 1],
    ['number', currentStrokeWidth ?? 0]
  ]);
  map.setPaintProperty(layerId, 'line-color', [
    'case',
    ['boolean', ['feature-state', 'selected'], false],
    ['string', DEFAULT_SELECTION_COLOR],
    ['string', currentStrokeColor ?? 'transparent']
  ]);

  addSelectListeners(map, layerId, sourceLayerId);
}

/**
 * Add a selection indicator to a feature in a polygon layer.
 *
 * @param map The top-level {@link Map} instance.
 * @param layerId The id of the layer to instrument.
 * @param sourceLayerId The id of the source layer to instrument. This is only
 * necessary for {@link CartoKitLayer}s with {@link CartoKitPMTilesSource}s.
 */
export function instrumentPolygonSelect(
  map: Map,
  layerId: string,
  sourceLayerId?: string
): void {
  map.addLayer({
    id: `${layerId}-select`,
    type: 'line',
    source: getSourceId(map, layerId),
    'source-layer': sourceLayerId,
    paint: {
      'line-color': DEFAULT_SELECTION_COLOR,
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
 * @param map The top-level {@link Map} instance.
 * @param lyrId The id of the layer to add event listeners to.
 * @param sourceLayerId The id of the source layer to instrument. This is only
 * necessary for {@link CartoKitLayer}s with {@link CartoKitPMTilesSource}s.
 */
function addSelectListeners(
  map: Map,
  lyrId: string,
  sourceLayerId?: string
): void {
  let featureId: string | number | undefined;
  const sourceId = getSourceId(map, lyrId);

  function onClick(event: MapLayerMouseEvent): void {
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

      if (id !== undefined) {
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

  function onContextMenu(e: MapMouseEvent) {
    contextMenu.x = e.originalEvent.clientX;
    contextMenu.y = e.originalEvent.clientY;
    contextMenu.layerId = lyrId;
  }

  map.on('contextmenu', lyrId, onContextMenu);

  const layerListeners = listeners.value.get(lyrId)!;
  listeners.value.set(lyrId, {
    ...layerListeners,
    click: onClick,
    contextmenu: onContextMenu
  });
}

/**
 * A global event listener for deselecting features.
 *
 * @param map The top-level {@link Map} instance.
 * @param layers The current {@link CartoKitLayer}s on the map.
 * @returns A callback to run when a map mouse event intersects no features.
 */
export function onFeatureLeave(
  map: Map,
  layers: Record<string, CartoKitLayer>
): (event: MapMouseEvent) => void {
  return (event: MapMouseEvent): void => {
    const instrumentedLayerIds = Object.values(layers).map((layer) =>
      getInstrumentedLayerId(layer.id, layer.type)
    );
    const features = map.queryRenderedFeatures(event.point, {
      layers: instrumentedLayerIds
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

    // Remove the context menu in all instances.
    contextMenu.layerId = '';
  };
}
