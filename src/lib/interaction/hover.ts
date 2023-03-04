import type { Map, MapLayerMouseEvent } from 'maplibre-gl';

import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

/**
 * Add a hover effect to all features in a polygon layer.
 *
 * @param map – The top-level MapLibre GL map instance.
 * @param layer – The CartoKit layer to add the hover effect to.
 */
export function instrumentPolygonHover(map: Map, layer: CartoKitLayer): void {
	map.addLayer({
		id: `${layer.id}-hover`,
		type: 'line',
		source: layer.id,
		paint: {
			'line-color': '#FFFFFF',
			'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0]
		}
	});

	addHoverListeners(map, layer);
}

/**
 * Add a hover effect to all features in a point layer.
 *
 * @param map – The top-level MapLibre GL map instance.
 * @param layer – The CartoKit layer to add the hover effect to.
 */
export function instrumentPointHover(map: Map, layer: CartoKitLayer): void {
	const currentStrokeWidth = map.getPaintProperty(layer.id, 'circle-stroke-width');
	const currentStrokeColor = map.getPaintProperty(layer.id, 'circle-stroke-color');

	map.setPaintProperty(layer.id, 'circle-stroke-width', [
		'case',
		['boolean', ['feature-state', 'hover'], false],
		1,
		currentStrokeWidth ?? 0
	]);
	map.setPaintProperty(layer.id, 'circle-stroke-color', [
		'case',
		['boolean', ['feature-state', 'hover'], false],
		'#FFFFFF',
		currentStrokeColor ?? 'transparent'
	]);

	addHoverListeners(map, layer);
}

/**
 * Wire up event listeners for hover effects.
 *
 * @param map – The top-level MapLibre GL map instance.
 * @param layer – The CartoKit layer to wire the listeners to.
 */
function addHoverListeners(map: Map, layer: CartoKitLayer): void {
	let hoveredFeatureId: string | null = null;

	function onMouseMove(event: MapLayerMouseEvent) {
		if (event.features && event.features.length > 0) {
			if (hoveredFeatureId !== null) {
				map.setFeatureState({ source: layer.id, id: hoveredFeatureId }, { hover: false });
			}

			hoveredFeatureId = event.features[0].id?.toString() ?? null;

			if (hoveredFeatureId) {
				map.setFeatureState({ source: layer.id, id: hoveredFeatureId }, { hover: true });
			}
		}
	}

	function onMouseLeave() {
		if (hoveredFeatureId !== null) {
			map.setFeatureState({ source: layer.id, id: hoveredFeatureId }, { hover: false });
		}
		hoveredFeatureId = null;
	}

	map.on('mousemove', layer.id, onMouseMove);
	map.on('mouseleave', layer.id, onMouseLeave);
}
