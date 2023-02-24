import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

/**
 * Compile the data source for a CartoKit layer.
 *
 * @param layer – a CartoKit layer.
 *
 * @returns – a Mapbox GL JS program fragment.
 */
export const compileSource = (layer: CartoKitLayer): string => {
	return `
  map.addSource('${layer.id}', {
		type: 'geojson',
		data: '${layer.data}'
	});
  `;
};
