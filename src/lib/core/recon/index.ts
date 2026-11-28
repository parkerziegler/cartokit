import { flow } from 'lodash-es';

import type { CartoKitDiff } from '#lib/core/diff/index.ts';
import { reconFillDiffs } from '#lib/core/recon/fill/index.ts';
import { reconHeatmapDiffs } from '#lib/core/recon/heatmap/index.ts';
import { reconLayerDiffs } from '#lib/core/recon/layer/index.ts';
import { reconLayerTypeDiffs } from '#lib/core/recon/layer-type/index.ts';
import { reconMapDiffs } from '#lib/core/recon/map/index.ts';
import { reconSizeDiffs } from '#lib/core/recon/size/index.ts';
import { reconStrokeDiffs } from '#lib/core/recon/stroke/index.ts';
import { reconTransformationDiffs } from '#lib/core/recon/transformation/index.ts';
import type { CartoKitIR } from '#lib/types/index.ts';

export interface ReconFnParams {
  diff: CartoKitDiff;
  targetIR: CartoKitIR;
}

export type ReconFnResult = ReconFnParams;

/**
 * Reconcile the map based on the {@link CartoKitDiff} and target {@link CartoKitIR}.
 *
 * @param diff The {@link CartoKitDiff} to reconcile.
 * @param targetIR The target {@link CartoKitIR} to reconcile to.
 */
export async function recon(
  diff: CartoKitDiff,
  targetIR: CartoKitIR
): Promise<void> {
  const reconciler = flow(
    reconFillDiffs,
    reconHeatmapDiffs,
    reconLayerDiffs,
    reconLayerTypeDiffs,
    reconMapDiffs,
    reconSizeDiffs,
    reconStrokeDiffs,
    reconTransformationDiffs
  );

  await reconciler(Promise.resolve({ diff, targetIR }));
}
