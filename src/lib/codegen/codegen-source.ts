import camelCase from 'lodash.camelcase';

import type {
  CartoKitDotDensityLayer,
  CartoKitLayer,
  CartoKitProportionalSymbolLayer
} from '$lib/types/CartoKitLayer';
import { getFeatureCollectionType } from '$lib/utils/geojson';

/**
 * Generate the data source for a CartoKit layer.
 *
 * @param layer – A CartoKitProportionalSymbolLayer.
 * @param dataTable – A symbol table mapping layer ids to identifiers referencing imported source data.
 *
 * @returns – a Mapbox GL JS program fragment.
 */
export function codegenSource(
  layer: CartoKitLayer,
  dataTable: Map<string, string>
): string {
  const geometry = getFeatureCollectionType(layer.data.geoJSON);
  const rawGeometry = getFeatureCollectionType(layer.data.rawGeoJSON);

  let transformation = '';
  let features = '';

  if (
    (geometry === 'Point' || geometry === 'MultiPoint') &&
    (rawGeometry === 'Polygon' || rawGeometry === 'MultiPolygon')
  ) {
    switch (layer.type) {
      case 'Proportional Symbol':
        ({ transformation, features } = codegenProportionalSymbolTransformation(
          layer,
          dataTable
        ));
        break;
      case 'Dot Density':
        ({ transformation, features } = codegenDotDensityTransformation(
          layer,
          dataTable
        ));
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
        ? features
        : layer.data.url
        ? `"${layer.data.url}"`
        : `${camelCase(layer.data.fileName)}`
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
function codegenProportionalSymbolTransformation(
  layer: CartoKitProportionalSymbolLayer,
  dataTable: Map<string, string>
): TransformationProgramFragment {
  const dataIdent = dataTable.get(layer.id) ?? 'data';

  const transformation = `
		const centroids = ${dataIdent}.features.map((feature) => {
			return turf.feature(turf.centroid(feature).geometry, feature.properties);
		});
	`;

  const features = 'turf.featureCollection(centroids)';

  return { transformation, features };
}

/**
 * Generate the data transformation for a CartoKitProportionalSymbolLayer.
 *
 * @param layer – A CartoKitDotDensityLayer.
 * @param dataTable – A symbol table mapping layer ids to identifiers referencing imported source data.
 *
 * @returns – A "transformation" and "features" program fragment.
 */
function codegenDotDensityTransformation(
  layer: CartoKitDotDensityLayer,
  dataTable: Map<string, string>
): TransformationProgramFragment {
  const dataIdent = dataTable.get(layer.id) ?? 'data';

  const transformation = `
	const dots = ${dataIdent}.features.flatMap((feature) => {
		const numPoints = Math.floor(feature.properties["${layer.attribute}"] / ${layer.style.dots.value});

		const bbox = turf.bbox(feature);
		const selectedFeatures = [];

		while (selectedFeatures.length < numPoints) {
			const candidate = turf.randomPoint(1, { bbox }).features[0];

			if (turf.booleanWithin(candidate, feature)) {
				selectedFeatures.push(candidate);
			}
		}

		return selectedFeatures.flatMap((point) => {
			return turf.feature(point.geometry, feature.properties);
		});
	});
	`;

  const features = 'turf.featureCollection(dots)';

  return { transformation, features };
}
