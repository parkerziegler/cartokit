import type { CartoKitDotDensityLayer, CartoKitLayer } from '$lib/types/CartoKitLayer';
import { getFeatureCollectionType } from '$lib/utils/geojson';

/**
 * Generate the data source for a CartoKit layer.
 *
 * @param layer – a CartoKit layer.
 *
 * @returns – a Mapbox GL JS program fragment.
 */
export function codegenSource(layer: CartoKitLayer): string {
	const geometry = getFeatureCollectionType(layer.data.geoJSON);
	const rawGeometry = getFeatureCollectionType(layer.data.rawGeoJSON);

	let transformation = '';
	let features = 'data';

	if (
		(geometry === 'Point' || geometry === 'MultiPoint') &&
		(rawGeometry === 'Polygon' || rawGeometry === 'MultiPolygon')
	) {
		switch (layer.type) {
			case 'Proportional Symbol':
				({ transformation, features } = codegenProportionalSymbolTransformation());
				break;
			case 'Dot Density':
				({ transformation, features } = codegenDotDensityTransformation(layer));
				break;
			default:
				break;
		}
	}

	return transformation.concat(`
  map.addSource('${layer.id}', {
		type: 'geojson',
		data: ${
			transformation
				? `{ type: "FeatureCollection", features: ${features} }`
				: layer.data.url
				? `"${layer.data.url}"`
				: JSON.stringify(layer.data.geoJSON, null, 2)
		}
	});
  `);
}

interface TransformationProgramFragment {
	transformation: string;
	features: string;
}

/**
 * Generate the data transformation for a CartoKitProportionalSymbolLayer.
 *
 * @returns – a "transformation" and "features" program fragment.
 */
function codegenProportionalSymbolTransformation(): TransformationProgramFragment {
	const transformation = `
		const centroids = data.features.map((feature) => {
			return turf.feature(turf.centroid(feature).geometry, feature.properties);
		});
	`;

	const features = 'turf.featureCollection(centroids)';

	return { transformation, features };
}

/**
 * Generate the data transformation for a CartoKitProportionalSymbolLayer.
 *
 * @param layer – a CartoKitDotDensityLayer.
 *
 * @returns – a "transformation" and "features" program fragment.
 */
function codegenDotDensityTransformation(
	layer: CartoKitDotDensityLayer
): TransformationProgramFragment {
	const transformation = `
	const dots = data.features.flatMap((feature) => {
		const numPoints = Math.floor(feature.properties["${layer.attribute}"] / ${layer.style.dots.value});

		const bbox = turf.bbox(feature);
		const points = turf.randomPoint(numPoints, { bbox });

		return points.features.flatMap((point) => {
			return turf.feature(point.geometry, feature.properties);
		});
	});
	`;

	const features = 'turf.featureCollection(dots)';

	return { transformation, features };
}
