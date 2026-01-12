import { flow } from 'lodash-es';

import type { CartoKitDiff } from '$lib/core/diff';
import { reconDotDensityDiffs } from '$lib/core/recon/dot';
import { reconFillDiffs } from '$lib/core/recon/fill';
import { reconHeatmapDiffs } from '$lib/core/recon/heatmap';
import { reconLayerDiffs } from '$lib/core/recon/layer';
import { reconLayerTypeDiffs } from '$lib/core/recon/layer-type';
import { reconMapDiffs } from '$lib/core/recon/map';
import { reconSizeDiffs } from '$lib/core/recon/size';
import { reconStrokeDiffs } from '$lib/core/recon/stroke';
import type { CartoKitIR } from '$lib/types';

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
    reconDotDensityDiffs,
    reconFillDiffs,
    reconHeatmapDiffs,
    reconLayerDiffs,
    reconLayerTypeDiffs,
    reconMapDiffs,
    reconSizeDiffs,
    reconStrokeDiffs
  );

  await reconciler(Promise.resolve({ diff, targetIR }));
}
