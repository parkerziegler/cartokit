import type { CartoKitBackendAnalysis } from '$lib/types';

/**
 * Generate a JavaScript program fragment for top-level, reusable functions.
 *
 * @param analysis – The analysis of the CartoKit IR.
 * @returns – A JavaScript program fragment.
 */
export function codegenFns(analysis: CartoKitBackendAnalysis): string {
  const fns: string[] = [];

  if (analysis.isFetchGeoJSONRequired) {
    const errorPayload =
      '`Failed to fetch GeoJSON at: ${url}. Original error: ${error}`';

    fns.push(`async function fetchGeoJSON(url) {
      try {
        const response = await fetch(url);
        const data = await response.json();

        return data;
      } catch (error) {
        throw new Error(${errorPayload});
      }
    }`);
  }

  return fns.join('\n');
}
