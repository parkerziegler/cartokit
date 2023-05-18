import type { CartoKitIR } from '$lib/stores/ir';

/**
 * Generate top-level reusable functions within the JS module.
 *
 * @param ir – The CartoKit IR.
 * @param transformTable — The transformation symbol table.
 *
 * @returns – A program fragment.
 */
export function codegenFns(
  ir: CartoKitIR,
  transformTable: Map<string, boolean>
): string {
  const fns: string[] = [];

  if (isFetchGeoJSONRequired(ir, transformTable)) {
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
export function isFetchGeoJSONRequired(
  { layers }: CartoKitIR,
  transformTable: Map<string, boolean>
): boolean {
  for (const layer of Object.values(layers)) {
    if (layer.data.url && transformTable.has(layer.id)) {
      return true;
    }
  }

  return false;
}
