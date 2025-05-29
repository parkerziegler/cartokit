import type { CartoKitBackendAnalysis, Transformation } from '$lib/types';
import { transformDotDensity } from '$lib/utils/transformation';

/**
 * Generate a JavaScript program fragment for a single transformation function.
 *
 * @param transformation – A @see{Transformation}.
 * @returns – A JavaScript program fragment.
 */
function codegenTransformationFn(transformation: Transformation): string {
  return `function ${transformation.name}(${transformation.args.join(', ')}) {
  ${transformation.definition}
}`;
}

/**
 * Generate a JavaScript program fragment for top-level, reusable functions.
 *
 * @param analysis – The analysis of the CartoKit IR.
 * @returns – A JavaScript program fragment.
 */
export function codegenFns(analysis: CartoKitBackendAnalysis): string {
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

  if (analysis.isTransformDotDensityRequired) {
    fns.push(`function ${transformDotDensity.name}(${transformDotDensity.params.join(', ')}) {
      ${transformDotDensity.definition}
    }`);
  }

  return fns.join('\n');
}
