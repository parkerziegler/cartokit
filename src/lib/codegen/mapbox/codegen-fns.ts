import type { CartoKitIR } from '$lib/types';

/**
 * Generate top-level reusable functions within the JS module.
 *
 * @param ir – The CartoKit IR.
 * @param transformTable — The transformation symbol table.
 *
 * @returns – A program fragment.
 */
export function codegenFns(ir: CartoKitIR): string {
  const fns: string[] = [];

  if (isFetchGeoJSONRequired(ir)) {
    fns.push(`async function fetchGeoJSON(url) {
      try {
        const response = await fetch(url);
        const data = await response.json();

        return data;
      } catch (error) {
        throw new Error('Failed to fetch GeoJSON at: ' + url, error);
      }
    }`);
  }

  return fns.join('\n');
}

/**
 * Determine whether we need to inline a function to fetch GeoJSON hosted at a
 * remote URL.
 *
 * @param ir – The CartoKit IR.
 * @param transformTable – The transformation symbol table.
 *
 * @returns – A Boolean value indicting whether we need to inline a function to
 * fetch GeoJSON hosted at a remote URL.
 */
export function isFetchGeoJSONRequired({ layers }: CartoKitIR): boolean {
  for (const layer of Object.values(layers)) {
    if (layer.data.url && layer.data.transformations.length > 0) {
      return true;
    }
  }

  return false;
}
