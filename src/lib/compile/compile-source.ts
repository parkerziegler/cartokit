import type {
	CartoKitDotDensityLayer,
	CartoKitLayer,
	CartoKitProportionalSymbolLayer
} from '$lib/types/CartoKitLayer';
import { getFeatureCollectionType } from '$lib/utils/geojson';

/**
 * Compile the data source for a CartoKit layer.
 *
 * @param layer – a CartoKit layer.
 *
 * @returns – a Mapbox GL JS program fragment.
 */
export function compileSource(layer: CartoKitLayer): string {
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
				({ transformation, features } = compileProportionalSymbolTransformation());
				break;
			case 'Dot Density':
				({ transformation, features } = compileDotDensityTransformation(layer));
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

function compileProportionalSymbolTransformation(): TransformationProgramFragment {
	const transformation = `
		const centroids = data.map((feature) => {
			return turf.feature(turf.centroid(feature).geometry, feature.properties);
		});
	`;

	const features = 'turf.featureCollection(centroids)';

	return { transformation, features };
}

function compileDotDensityTransformation(
	layer: CartoKitDotDensityLayer
): TransformationProgramFragment {
	const transformation = `
	const dots = features.flatMap((feature) => {
		const numPoints = Math.floor(feature.properties?.${layer.attribute} / ${layer.style.dots.value}) ?? 0;

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
