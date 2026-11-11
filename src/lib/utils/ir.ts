import type { CartoKitIR } from '$lib/types';

/**
 * Get the ids of the layers directly derived from the queried layer.
 *
 * @param ir The {@link CartoKitIR}.
 * @param parentLayerId The id of the parent layer.
 * @returns The ids of the layers whose source is a table read from the parent.
 */
export function getLayerDescendants(
  ir: CartoKitIR,
  parentLayerId: string
): Set<string> {
  const descendants = new Set<string>();

  for (const layer of Object.values(ir.layers)) {
    if (
      layer.source.type === 'table' &&
      layer.source.location.parentLayerId === parentLayerId &&
      !layer.layout.deleted
    ) {
      descendants.add(layer.id);
    }
  }

  return descendants;
}
