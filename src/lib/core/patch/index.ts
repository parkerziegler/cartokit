import { flow } from 'lodash-es';

import type { CartoKitDiff } from '#lib/core/diff/index.ts';
import { patchFillDiffs } from '#lib/core/patch/fill/index.ts';
import { patchHeatmapDiffs } from '#lib/core/patch/heatmap/index.ts';
import { patchLayerDiffs } from '#lib/core/patch/layer/index.ts';
import { patchLayerTypeDiffs } from '#lib/core/patch/layer-type/index.ts';
import { patchMapDiffs } from '#lib/core/patch/map/index.ts';
import { patchSizeDiffs } from '#lib/core/patch/size/index.ts';
import { patchStrokeDiffs } from '#lib/core/patch/stroke/index.ts';
import { patchTransformationDiffs } from '#lib/core/patch/transformation/index.ts';

import type { CartoKitIR } from '#lib/types/index.ts';

export interface PatchFnParams {
  diff: CartoKitDiff;
  ir: CartoKitIR;
  inverseDiff: CartoKitDiff;
}

export type PatchFnResult = PatchFnParams;

/**
 * Patch a {@link CartoKitDiff} onto the current {@link CartoKitIR}, mutating
 * it in place.
 *
 * @param diff The {@link CartoKitDiff} to apply.
 * @param currentIR The current {@link CartoKitIR} to patch.
 * @returns A promise that resolves to the inverse {@link CartoKitDiff}.
 */
export async function patch(
  diff: CartoKitDiff,
  currentIR: CartoKitIR
): Promise<CartoKitDiff> {
  const patcher = flow(
    patchFillDiffs,
    patchHeatmapDiffs,
    patchLayerDiffs,
    patchLayerTypeDiffs,
    patchMapDiffs,
    patchStrokeDiffs,
    patchSizeDiffs,
    patchTransformationDiffs
  );

  const { inverseDiff } = await patcher(
    Promise.resolve({ diff, ir: currentIR, inverseDiff: diff })
  );

  return inverseDiff;
}
