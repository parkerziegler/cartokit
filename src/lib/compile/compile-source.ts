import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

/**
 * Compile the data source for a CartoKit layer.
 *
 * @param layer – a CartoKit layer.
 *
 * @returns – a Mapbox GL JS program fragment.
 */
export const compileSource = (layer: CartoKitLayer): string => {
	const geometry = layer.data.geoJSON.features?.[0]?.geometry?.type;
	const rawGeometry = layer.data.rawGeoJSON.features?.[0]?.geometry?.type;

	let transformation = '';

	if (
		(geometry === 'Point' || geometry === 'MultiPoint') &&
		(rawGeometry === 'Polygon' || rawGeometry === 'MultiPolygon')
	) {
		transformation = `
			const centroids = data.map((feature) => {
				return turf.feature(turf.centroid(feature).geometry, feature.properties);
			});
		`;
	}

	return transformation.concat(`
  map.addSource('${layer.id}', {
		type: 'geojson',
		data: '${
			layer.data.url ??
			`{ type: "FeatureCollection", features: ${
				transformation ? 'turf.featureCollection(centroids)' : 'data'
			} }`
		}'
	});
  `);
};
