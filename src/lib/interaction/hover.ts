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

	addHoverListeners(map, layer.id);
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

	addHoverListeners(map, layer.id);
}

/**
 * Add a hover effect to enclosing polygons in a dot density layer.
 *
 * @param map – The top-level MapLibre GL map instance.
 * @param layer – The CartoKit layer to add the hover effect to.
 */
export function instrumentDotDensityHover(map: Map, layer: CartoKitLayer): void {
	// Add a separate source for the polygon outlines of the dot density layer.
	// Ensure it does not already exist from a previous transition before adding it.
	if (!map.getSource(`${layer.id}-outlines`)) {
		map.addSource(`${layer.id}-outlines`, {
			type: 'geojson',
			data: layer.data.rawGeoJSON
		});
	}

	// Add a transparent layer to the map for the outlines.
	map.addLayer({
		id: `${layer.id}-outlines`,
		type: 'fill',
		source: `${layer.id}-outlines`,
		paint: {
			'fill-color': 'transparent',
			'fill-opacity': 0
		}
	});

	map.addLayer({
		id: `${layer.id}-hover`,
		type: 'line',
		source: `${layer.id}-outlines`,
		paint: {
			'line-color': '#FFFFFF',
			'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0]
		}
	});

	addHoverListeners(map, `${layer.id}-outlines`);
}

/**
 * Wire up event listeners for hover effects.
 *
 * @param map – The top-level MapLibre GL map instance.
 * @param layerId – The id of the layer to wire the listeners to.
 */
function addHoverListeners(map: Map, layerId: string): void {
	let hoveredFeatureId: string | null = null;

	function onMouseMove(event: MapLayerMouseEvent) {
		if (event.features && event.features.length > 0) {
			if (hoveredFeatureId !== null) {
				map.setFeatureState({ source: layerId, id: hoveredFeatureId }, { hover: false });
			}

			hoveredFeatureId = event.features[0].id?.toString() ?? null;

			if (hoveredFeatureId) {
				map.setFeatureState({ source: layerId, id: hoveredFeatureId }, { hover: true });
			}
		}
	}

	function onMouseLeave() {
		if (hoveredFeatureId !== null) {
			map.setFeatureState({ source: layerId, id: hoveredFeatureId }, { hover: false });
		}
		hoveredFeatureId = null;
	}

	map.on('mousemove', layerId, onMouseMove);
	map.on('mouseleave', layerId, onMouseLeave);
}
