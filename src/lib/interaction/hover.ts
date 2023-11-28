import type { Map, MapLayerMouseEvent } from 'maplibre-gl';

import { listeners } from '$lib/stores/listeners';

/**
 * Add a hover effect to all features in a point layer.
 *
 * @param map – The top-level MapLibre GL map instance.
 * @param layer – The id of the layer to instrument.
 */
export const instrumentPointHover = (map: Map, layerId: string): void => {
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
};

/**
 * Add a hover effect to all features in a line layer.
 *
 * @param map – The top-level MapLibre GL map instance.
 * @param layerId – The id of the layer to instrument.
 */
export const instrumentLineHover = (map: Map, layerId: string): void => {
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
};

/**
 * Add a hover effect to all features in a polygon layer.
 *
 * @param map – The top-level MapLibre GL map instance.
 * @param layerId – The id of the layer to instrument.
 */
export const instrumentPolygonHover = (map: Map, layerId: string): void => {
  map.addLayer({
    id: `${layerId}-hover`,
    type: 'line',
    source: layerId,
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

  addHoverListeners(map, layerId);
};

/**
 * Wire up event listeners for hover effects.
 *
 * @param map – The top-level MapLibre GL map instance.
 * @param layerId – The id of the layer to instrument.
 */
const addHoverListeners = (map: Map, layerId: string): void => {
  let hoveredFeatureId: string | null = null;

  const onMouseMove = (event: MapLayerMouseEvent): void => {
    if (event.features && event.features.length > 0) {
      if (hoveredFeatureId !== null) {
        map.setFeatureState(
          { source: layerId, id: hoveredFeatureId },
          { hover: false }
        );
      }

      hoveredFeatureId = event.features[0].id?.toString() ?? null;

      if (hoveredFeatureId) {
        map.setFeatureState(
          { source: layerId, id: hoveredFeatureId },
          { hover: true }
        );
      }
    }
  };

  const onMouseLeave = (): void => {
    if (hoveredFeatureId !== null) {
      map.setFeatureState(
        { source: layerId, id: hoveredFeatureId },
        { hover: false }
      );
    }
    hoveredFeatureId = null;
  };

  map.on('mousemove', layerId, onMouseMove);
  map.on('mouseleave', layerId, onMouseLeave);

  listeners.update((ls) => {
    const layerListeners = ls.get(layerId) ?? {
      /* eslint-disable @typescript-eslint/no-empty-function */
      click: () => {},
      mousemove: () => {},
      mouseleave: () => {}
      /* eslint-enable-next-line @typescript-eslint/no-empty-function */
    };

    return ls.set(layerId, {
      ...layerListeners,
      mousemove: onMouseMove,
      mouseleave: onMouseLeave
    });
  });
};
