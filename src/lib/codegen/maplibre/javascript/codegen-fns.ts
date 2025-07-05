import { uniqBy } from 'lodash-es';

import type {
  CartoKitIR,
  CartoKitBackendAnalysis,
  Transformation
} from '$lib/types';

/**
 * Generate a JavaScript program fragment for a single transformation function.
 *
 * @param transformation – A @see{Transformation}.
 * @returns – A JavaScript program fragment.
 */
function codegenTransformationFn(transformation: Transformation): string {
  return `function ${transformation.name}(${transformation.params.join(', ')})
  ${transformation.definitionJS}
`;
}

/**
 * Generate a JavaScript program fragment for top-level, reusable functions.
 *
 * @param analysis – The analysis of the CartoKit IR.
 * @returns – A JavaScript program fragment.
 */
export function codegenFns(
  ir: CartoKitIR,
  analysis: CartoKitBackendAnalysis
): string {
  const fns: string[] = [];

  if (analysis.isFetchGeoJSONRequired) {
    const errorMessage =
      '`Failed to fetch GeoJSON at: ${url}. Original error: ${error}`';

    fns.push(`async function fetchGeoJSON(url) {
      try {
        const response = await fetch(url);
        const data = await response.json();

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
