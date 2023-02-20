import type { Map, MapboxGeoJSONFeature, MapLayerMouseEvent } from 'mapbox-gl';
import type { Writable } from 'svelte/store';

import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

interface InstrumentSelectParams {
	map: Map;
	layers: CartoKitLayer[];
	selectedFeature: Writable<MapboxGeoJSONFeature | null>;
}

/**
 * Add a selection indicator to a feature in a layer.
 *
 * @param map – The top-level Mapbox GL map instance.
 * @param layer – A CartoKit layer to add a select effect to.
 */
export function instrumentSelect({ map, layers, selectedFeature }: InstrumentSelectParams): void {
	const layerIds: string[] = [];

	layers.forEach((layer) => {
		layerIds.push(layer.id);

		map.addLayer({
			id: `${layer.id}-select`,
			type: 'line',
			source: layer.id,
			paint: {
				'line-color': '#A534FF',
				'line-width': ['case', ['boolean', ['feature-state', 'selected'], false], 1, 0]
			}
		});
	});

	let selectedLayerId: string | null = null;
	let selectedFeatureId: string | null = null;

	function onClick(event: MapLayerMouseEvent) {
		const features = map.queryRenderedFeatures(event.point, { layers: layerIds });

		if (features.length > 0) {
			// Clear any previously selected feature.
			if (selectedFeatureId !== null && selectedLayerId !== null) {
				map.setFeatureState(
					{ source: selectedLayerId, id: selectedFeatureId },
					{ selected: false }
				);
			}

			// We forcibly assign an "id" property to all layers.
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			selectedFeatureId = features[0].id!.toString();
			selectedLayerId = features[0].layer.id;

			map.setFeatureState(
				{ source: features[0].layer.id, id: selectedFeatureId },
				{ selected: true }
			);
			selectedFeature.set(features[0]);
		} else if (selectedFeatureId !== null && selectedLayerId !== null) {
			// If no features are returned in the event, clear the selection.
			map.setFeatureState({ source: selectedLayerId, id: selectedFeatureId }, { selected: false });
			selectedFeatureId = null;
			selectedLayerId = null;
			selectedFeature.set(null);
		}
	}

	map.on('click', onClick);
}
