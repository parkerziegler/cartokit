import type { Map, MapLayerMouseEvent } from 'maplibre-gl';

/**
 * Add a hover effect to all features in a polygon layer.
 *
 * @param map – The top-level MapLibre GL map instance.
 * @param layerId – The id of the layer to instrument.
 */
export function instrumentPolygonHover(map: Map, layerId: string): void {
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
}

/**
 * Add a hover effect to all features in a point layer.
 *
 * @param map – The top-level MapLibre GL map instance.
 * @param layer – The id of the layer to instrument.
 */
export function instrumentPointHover(map: Map, layerId: string): void {
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
 * Wire up event listeners for hover effects.
 *
 * @param map – The top-level MapLibre GL map instance.
 * @param layerId – The id of the layer to instrument.
 */
function addHoverListeners(map: Map, layerId: string): void {
  let hoveredFeatureId: string | null = null;

  function onMouseMove(event: MapLayerMouseEvent) {
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
  }

  function onMouseLeave() {
    if (hoveredFeatureId !== null) {
      map.setFeatureState(
        { source: layerId, id: hoveredFeatureId },
        { hover: false }
      );
    }
    hoveredFeatureId = null;
  }

  map.on('mousemove', layerId, onMouseMove);
  map.on('mouseleave', layerId, onMouseLeave);
}
