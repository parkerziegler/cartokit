import type { CartoKitDiff } from '#lib/core/diff/index.ts';
import type { PatchFnParams, PatchFnResult } from '#lib/core/patch/index.ts';
import { db } from '#lib/state/db.svelte.ts';
import type { CartoKitTableSource } from '#lib/types/source.ts';
import type { BufferTransformation } from '#lib/types/transformation.ts';
import { createTable } from '#lib/utils/db.ts';

/**
 * Patch transformation-related {@link CartoKitDiff}s for the current
 * {@link CartoKitIR}.
 *
 * @param params A promise that resolves to the {@link PatchFnParams}, including
 * the current {@link CartoKitDiff} and {@link CartoKitIR}.
 * @returns A promise that resolves to the {@link PatchFnResult}, including
 * the current {@link CartoKitDiff} and patched {@link CartoKitIR}.
 */
export async function patchTransformationDiffs(
  params: Promise<PatchFnParams>
): Promise<PatchFnResult> {
  const { diff, ir, inverseDiff } = await params;

  let inverse: CartoKitDiff = inverseDiff;

  switch (diff.type) {
    case 'update-buffer-distance': {
      const source = ir.layers[diff.layerId].source as CartoKitTableSource;
      const transformation = source.location
        .transformation as BufferTransformation;

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'update-buffer-distance',
        layerId: diff.layerId,
        payload: {
          distance: transformation.args.distance
        }
      };

      // Apply the patch.
      transformation.args.distance = diff.payload.distance;

      // Rebuild the derived table from its parent using the new distance.
      await db.value!.conn.query(`DROP TABLE IF EXISTS ${diff.layerId};`);
      source.table = await createTable({
        db: db.value!.db,
        conn: db.value!.conn,
        layerId: diff.layerId,
        location: source.location
      });

      break;
    }
  }

  return {
    diff,
    ir,
    inverseDiff: inverse
  };
}
