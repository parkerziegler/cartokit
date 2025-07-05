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
function codegenTransformationFn(transformation: Transformation): string {
  const params = transformation.params.map((param, index) => {
    const type = transformation.paramTypes[index];

    return `${param}: ${type}`;
  });

  return `function ${transformation.name}(${params.join(', ')}): ${transformation.returnType}
  ${transformation.definitionTS}
`;
}

/**
 * Generate a TypeScript program fragment for top-level, reusable functions.
 *
 * @param analysis – The analysis of the CartoKit IR.
 * @returns – A TypeScript program fragment.
 */
export function codegenFns(
  ir: CartoKitIR,
  analysis: CartoKitBackendAnalysis
): string {
  const fns: string[] = [];

  if (analysis.isFetchGeoJSONRequired) {
    const errorMessage =
      '`Failed to fetch GeoJSON at: ${url}. Original error: ${error}`';

    fns.push(`async function fetchGeoJSON(url: string): Promise<GeoJSON.FeatureCollection> {
      try {
        const response = await fetch(url);
        const data = await (response.json()) as GeoJSON.FeatureCollection;

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
    fns.push(codegenTransformationFn(transformation));
  });

  return fns.join('\n\n');
}
