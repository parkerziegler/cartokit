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

import type { CartoKitIR } from '$lib/types';

export interface PatchFnParams {
  diff: CartoKitDiff;
  ir: CartoKitIR;
}

export type PatchFnResult = PatchFnParams;

/**
 * Patch a {@link CartoKitDiff} onto a source {@link CartoKitIR}.
 *
 * @param diff The {@link CartoKitDiff} to apply.
 * @param sourceIR The source {@link CartoKitIR} to patch.
 * @returns A promise that resolves to the patched {@link CartoKitIR}.
 */
export async function patch(
  diff: CartoKitDiff,
  sourceIR: CartoKitIR
): Promise<CartoKitIR> {
  const patcher = flow(
    patchDotDiffs,
    patchFillDiffs,
    patchHeatmapDiffs,
    patchLayerDiffs,
    patchLayerTypeDiffs,
    patchMapDiffs,
    patchStrokeDiffs,
    patchSizeDiffs
  );

  const { ir: targetIR } = await patcher(
    Promise.resolve({ diff, ir: sourceIR })
  );

  return targetIR;
}
