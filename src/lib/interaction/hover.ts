import type { Map, MapLayerMouseEvent } from 'mapbox-gl';

import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

/**
 * Add a hover effect to all features in a layer.
 *
 * @param map – The top-level Mapbox GL map instance.
 * @param layer – The CartoKit layer to add the hover effect to.
 */
export function instrumentHover(map: Map, layer: CartoKitLayer): void {
	map.addLayer({
		id: `${layer.id}-hover`,
		type: 'line',
		source: layer.id,
		paint: {
			'line-color': '#FFFFFF',
			'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0]
		}
	});

	let hoveredFeatureId: string | null = null;

	const onMouseMove = (event: MapLayerMouseEvent) => {
		if (event.features && event.features.length > 0) {
			if (hoveredFeatureId !== null) {
				map.setFeatureState({ source: layer.id, id: hoveredFeatureId }, { hover: false });
			}

			hoveredFeatureId = event.features[0].id?.toString() ?? null;

			if (hoveredFeatureId) {
				map.setFeatureState({ source: layer.id, id: hoveredFeatureId }, { hover: true });
			}
		}
	};

	const onMouseLeave = () => {
		if (hoveredFeatureId !== null) {
			map.setFeatureState({ source: layer.id, id: hoveredFeatureId }, { hover: false });
		}
		hoveredFeatureId = null;
	};

	map.on('mousemove', layer.id, onMouseMove);
	map.on('mouseleave', layer.id, onMouseLeave);
}
