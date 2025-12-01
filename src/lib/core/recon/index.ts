import { flow } from 'lodash-es';

import type { CartoKitDiff } from '$lib/core/diff';
import { reconFillDiffs } from '$lib/core/recon/fill';
import { reconHeatmapDiffs } from '$lib/core/recon/heatmap';
import { reconLayerDiffs } from '$lib/core/recon/layer';
import { reconLayerTypeDiffs } from '$lib/core/recon/layer-type';
import { reconSizeDiffs } from '$lib/core/recon/size';
import { reconStrokeDiffs } from '$lib/core/recon/stroke';
import type { CartoKitIR } from '$lib/types';

export interface ReconFnParams {
  diff: CartoKitDiff;
  sourceIR: CartoKitIR;
  targetIR: CartoKitIR;
}

export type ReconFnResult = ReconFnParams;

export function recon(
  diff: CartoKitDiff,
  sourceIR: CartoKitIR,
  targetIR: CartoKitIR
): void {
  const reconciler = flow(
    reconFillDiffs,
    reconHeatmapDiffs,
    reconLayerDiffs,
    reconLayerTypeDiffs,
    reconSizeDiffs,
    reconStrokeDiffs
  );

  reconciler({ diff, sourceIR, targetIR });
}
