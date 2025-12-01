import { flow } from 'lodash-es';

import type { CartoKitDiff } from '$lib/core/diff';
import { patchFillDiffs } from '$lib/core/patch/fill';
import { patchHeatmapDiffs } from '$lib/core/patch/heatmap';
import { patchLayerDiffs } from '$lib/core/patch/layer';
import { patchLayerTypeDiffs } from '$lib/core/patch/layer-type';
import { patchSizeDiffs } from '$lib/core/patch/size';
import { patchStrokeDiffs } from '$lib/core/patch/stroke';

import type { CartoKitIR } from '$lib/types';

export interface PatchFnParams {
  diff: CartoKitDiff;
  ir: CartoKitIR;
}

export type PatchFnResult = PatchFnParams;

export function patch(diff: CartoKitDiff, sourceIR: CartoKitIR): CartoKitIR {
  const patcher = flow(
    patchFillDiffs,
    patchLayerDiffs,
    patchLayerTypeDiffs,
    patchHeatmapDiffs,
    patchStrokeDiffs,
    patchSizeDiffs
  );

  const { ir: targetIR } = patcher({ diff, ir: sourceIR });
  return targetIR;
}
