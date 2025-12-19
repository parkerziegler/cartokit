import { uniqBy } from 'lodash-es';

import type {
  CartoKitIR,
  CartoKitBackendAnalysis,
  Transformation
} from '$lib/types';

/**
 * Generate a program fragment for a single transformation function.
 *
 * @param transformation A {@linkTransformation}.
 * @returns A program fragment for a transformation function definition.
 */
function codegenTransformationFn(
  transformation: Transformation,
  analysis: CartoKitBackendAnalysis
): string {
  const typed = analysis.language === 'typescript';

  const params = transformation.params.map((param, index) => {
    const type = transformation.paramTypes[index];

    return typed ? `${param}: ${type}` : param;
  });

  return `function ${transformation.name}(${params.join(', ')})${typed ? `: ${transformation.returnType}` : ''}
  ${typed ? transformation.definitionTS : transformation.definitionJS}
`;
}

/**
 * Generate a program fragment for top-level functions.
 *
 * @param ir The current {@link CartoKitIR}.
 * @param analysis The {@link CartoKitBackendAnalysis} for the current {@link CartoKitIR}.
 * @returns A program fragment containing the definitions of top-level functions.
 */
export function codegenFns(
  ir: CartoKitIR,
  analysis: CartoKitBackendAnalysis
): string {
  const typed = analysis.language === 'typescript';
  const fns: string[] = [];

  if (analysis.isFetchGeoJSONRequired) {
    const errorMessage =
      '`Failed to fetch GeoJSON at: ${url}. Original error: ${error}`';

    fns.push(`async function fetchGeoJSON(url${typed ? ': string' : ''})${typed ? ': Promise<GeoJSON.FeatureCollection>' : ''} {
      try {
        const response = await fetch(url);
        const data = await response.json()${typed ? ' as GeoJSON.FeatureCollection' : ''};

        return data;
      } catch (error) {
        throw new Error(${errorMessage});
      }
    }`);
  }

  // Obtain the set of transformations identified uniquely by their name
  // property and generate a function for each.
  uniqBy(
    Object.values(ir.layers).flatMap((layer) => layer.data.transformations),
    'name'
  ).forEach((transformation) => {
    fns.push(codegenTransformationFn(transformation, analysis));
  });

  return fns.join('\n\n');
}
