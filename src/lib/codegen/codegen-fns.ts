import { uniqBy } from 'lodash-es';

import type {
  CartoKitIR,
  CartoKitBackendAnalysis,
  Transformation
} from '$lib/types';

/**
 * Generate a TypeScript program fragment for a single transformation function.
 *
 * @param transformation – A @see{Transformation}.
 * @returns – A TypeScript program fragment.
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
 * Generate a program fragment for top-level, reusable functions.
 *
 * @param analysis – The analysis of the CartoKit IR.
 * @returns – A program fragment.
 */
export function codegenFns(
  ir: CartoKitIR,
  analysis: CartoKitBackendAnalysis
): string {
  const fns: string[] = [];
  const typed = analysis.language === 'typescript';

  if (analysis.isFetchGeoJSONRequired) {
    const errorMessage =
      '`Failed to fetch GeoJSON at: ${url}. Original error: ${error}`';

    fns.push(`async function fetchGeoJSON(url${typed ? ': string' : ''})${typed ? ': Promise<GeoJSON.FeatureCollection>' : ''} {
      try {
        const response = await fetch(url);
        const data = await (response.json())${typed ? ' as GeoJSON.FeatureCollection' : ''};

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
