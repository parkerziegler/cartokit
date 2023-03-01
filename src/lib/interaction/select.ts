import type { Map, MapLayerMouseEvent, MapMouseEvent } from 'mapbox-gl';
import { get } from 'svelte/store';

import { selectedFeature } from '$lib/stores/feature';
import type { CartoKitLayer } from '$lib/types/CartoKitLayer';
import type { CartoKitIR } from '$lib/stores/layers';

/**
 * Add a selection indicator to a feature in a polygon layer.
 *
 * @param map – The top-level Mapbox GL map instance.
 * @param layer – A CartoKit layer to add a select effect to.
 */
export function instrumentPolygonSelect(map: Map, layer: CartoKitLayer): void {
	map.addLayer({
		id: `${layer.id}-select`,
		type: 'line',
		source: layer.id,
		paint: {
			'line-color': '#A534FF',
			'line-width': ['case', ['boolean', ['feature-state', 'selected'], false], 1, 0]
		}
	});

	addSelectListeners(map, layer);
}

/**
 * Add a selection indicator to a feature in a point layer.
 *
 * @param map – The top-level Mapbox GL map instance.
 * @param layer – A CartoKit layer to add a select effect to.
 */
export function instrumentPointSelect(map: Map, layer: CartoKitLayer): void {
	const currentStrokeWidth = map.getPaintProperty(layer.id, 'circle-stroke-width');
	const currentStrokeColor = map.getPaintProperty(layer.id, 'circle-stroke-color');

	map.setPaintProperty(layer.id, 'circle-stroke-width', [
		'case',
		['boolean', ['feature-state', 'selected'], false],
		1,
		currentStrokeWidth ?? 0
	]);
	map.setPaintProperty(layer.id, 'circle-stroke-color', [
		'case',
		['boolean', ['feature-state', 'selected'], false],
		'#A534FF',
		currentStrokeColor ?? 'transparent'
	]);

	addSelectListeners(map, layer);
}

/**
 * Wire up event listeners for select effects.
 *
 * @param map – The top-level Mapbox GL map instance.
 * @param layer – The CartoKit layer to wire the listeners to.
 */
function addSelectListeners(map: Map, layer: CartoKitLayer) {
	let selectedFeatureId: string | null = null;

	function onClick(event: MapLayerMouseEvent): void {
		if (event.features && event.features.length > 0) {
			if (selectedFeatureId !== null) {
				map.setFeatureState({ source: layer.id, id: selectedFeatureId }, { selected: false });
			}

			// We forcibly assign an "id" property to all GeoJSON sources using generateId:
			// https://docs.mapbox.com/mapbox-gl-js/style-spec/sources/#geojson-generateId
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			selectedFeatureId = event.features[0].id!.toString();
			map.setFeatureState({ source: layer.id, id: selectedFeatureId }, { selected: true });
			selectedFeature.set(event.features[0]);
		}
	}

	map.on('click', layer.id, onClick);
}

/**
 * A global event listener for deselecting features.
 *
 * @param map – The top-level Mapbox GL map instance.
 * @param layers – The CartoKit IR.
 * @returns – deselectFeature, a callback to run when a map mouse event intersects no features.
 */
export function onFeatureLeave(map: Map, layers: CartoKitIR): (event: MapMouseEvent) => void {
	const layerIds = Object.keys(layers);

	return function deselectFeature(event: MapMouseEvent) {
		const features = map.queryRenderedFeatures(event.point, { layers: layerIds });
		const selectedFeatureId = get(selectedFeature)?.id?.toString();

		if (features.length === 0 && selectedFeatureId) {
			selectedFeature.set(null);

			layerIds.forEach((layerId) => {
				map.removeFeatureState({ source: layerId, id: selectedFeatureId }, 'selected');
			});
		}
	};
}
