import type { CartoKitIR } from '#lib/types/index.ts';

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

/**
 * Determine whether any layer whose data is still required derives from the
 * queried layer.
 *
 * Unlike {@link getLayerDescendants}, this looks through soft-deleted layers: a
 * soft-deleted child counts if a rendered layer derives from it in turn.
 *
 * @param ir The {@link CartoKitIR}.
 * @param parentLayerId The id of the parent layer.
 * @returns A Boolean value indicating whether the parent layer's table is read
 * by a layer whose data is required.
 */
export function hasRequiredDependents(
  ir: CartoKitIR,
  parentLayerId: string
): boolean {
  return Object.values(ir.layers).some(
    (layer) =>
      layer.source.type === 'table' &&
      layer.source.location.parentLayerId === parentLayerId &&
      isLayerDataRequired(ir, layer.id)
  );
}

/**
 * Determine whether a layer's data is still required, either because the layer
 * itself is rendered or because a layer that is rendered derives from it,
 * directly or transitively.
 *
 * A soft-deleted layer stays in the {@link CartoKitIR} so that its dependents
 * can keep reading its data. Once the last of those dependents is removed, the
 * layer is orphaned and its data is no longer required.
 *
 * @param ir The {@link CartoKitIR}.
 * @param layerId The id of the layer.
 * @returns A Boolean value indicating whether the layer's data is required.
 */
export function isLayerDataRequired(ir: CartoKitIR, layerId: string): boolean {
  return (
    !ir.layers[layerId].layout.deleted || hasRequiredDependents(ir, layerId)
  );
}
