import camelCase from 'lodash.camelcase';

import type {
  CartoKitLayer,
  CartoKitDotDensityLayer,
  CartoKitProportionalSymbolLayer
} from '$lib/types/CartoKitLayer';
import { getFeatureCollectionType } from '$lib/utils/geojson';

/**
 * Generate the data source for a CartoKit layer.
 *
 * @param layer – A CartoKitLayer
 * @param uploadTable – The symbol table tracking file uploads.
 *
 * @returns – A Mapbox GL JS program fragment.
 */
export function codegenSource(
  layer: CartoKitLayer,
  uploadTable: Map<string, string>
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
          uploadTable
        ));
        break;
      case 'Dot Density':
        ({ transformation, features } = codegenDotDensityTransformation(
          layer,
          uploadTable
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
        : `${camelCase(layer.displayName)}`
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
 * @param layer – A CartoKitProportionalSymbolLayer.
 * @param uploadTable – The symbol table tracking file uploads.
 *
 * @returns – A "transformation" and "features" program fragment.
 */
function codegenProportionalSymbolTransformation(
  layer: CartoKitProportionalSymbolLayer,
  uploadTable: Map<string, string>
): TransformationProgramFragment {
  const dataIdent = uploadTable.get(layer.id) ?? camelCase(layer.displayName);
  const fetchData =
    layer.data.url && !uploadTable.has(layer.id)
      ? `const ${dataIdent} = await fetchGeoJSON('${layer.data.url}');\n`
      : '';

  const transformation = `
    ${fetchData}
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
 * @param uploadTable – The symbol table tracking file uploads.
 *
 * @returns – A "transformation" and "features" program fragment.
 */
function codegenDotDensityTransformation(
  layer: CartoKitDotDensityLayer,
  uploadTable: Map<string, string>
): TransformationProgramFragment {
  const dataIdent = uploadTable.get(layer.id) ?? camelCase(layer.displayName);
  const fetchData =
    layer.data.url && !uploadTable.has(layer.id)
      ? `const ${dataIdent} = await fetchGeoJSON('${layer.data.url}');\n`
      : '';

  const transformation = `
  ${fetchData}
	const dots = ${dataIdent}.features.flatMap((feature) => {
		const numPoints = Math.floor(
      feature.properties['${layer.attribute}'] / ${layer.style.dots.value}
    );

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
