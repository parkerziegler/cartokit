import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

export const compileSource = (layer: CartoKitLayer) => {
	return `
  map.addSource('${layer.id}', {
		type: 'geojson',
		data: '${layer.data}'
	});
  `;
};
