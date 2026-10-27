import { flow } from 'lodash-es';

import type { CartoKitDiff } from '$lib/core/diff';
import { patchDotDiffs } from '$lib/core/patch/dot';
import { patchFillDiffs } from '$lib/core/patch/fill';
import { patchHeatmapDiffs } from '$lib/core/patch/heatmap';
import { patchLayerDiffs } from '$lib/core/patch/layer';
import { patchLayerTypeDiffs } from '$lib/core/patch/layer-type';
import { patchMapDiffs } from '$lib/core/patch/map';
import { patchSizeDiffs } from '$lib/core/patch/size';
import { patchStrokeDiffs } from '$lib/core/patch/stroke';
import { patchTransformationDiffs } from '$lib/core/patch/transformation';

import type { CartoKitIR } from '$lib/types';

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
    patchDotDiffs,
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
