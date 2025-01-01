import type { CartoKitBackendAnalysis } from '$lib/types';

/**
 * Generate a TypeScript program fragment for top-level, reusable functions.
 *
 * @param analysis – The analysis of the CartoKit IR.
 * @returns – A TypeScript program fragment.
 */
export function codegenFns(analysis: CartoKitBackendAnalysis): string {
  const fns: string[] = [];

  if (analysis.isFetchGeoJSONRequired) {
    const errorMessage =
      '`Failed to fetch GeoJSON at: ${url}. Original error: ${error}`';

    fns.push(`async function fetchGeoJSON(url: string): Promise<FeatureCollection> {
      try {
        const response = await fetch(url);
        const data = await response.json() as FeatureCollection;

        return data;
      } catch (error) {
        throw new Error(${errorMessage});
      }
    }`);
  }

  return fns.join('\n');
}
