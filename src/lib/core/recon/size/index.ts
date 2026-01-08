import type { ReconFnParams, ReconFnResult } from '$lib/core/recon';
import { deriveSize } from '$lib/interaction/geometry';
import { map } from '$lib/state/map.svelte';
import type { CartoKitProportionalSymbolLayer } from '$lib/types';

/**
 * Reconcile size-related {@link CartoKitDiff}s based on the target {@link CartoKitIR}.
 *
 * @param params A promise that resolves to the {@link ReconFnParams}, including
 * the current {@link CartoKitDiff}, source {@link CartoKitIR}, and target {@link CartoKitIR}.
 * @returns A promise that resolves to the {@link ReconFnResult}, including
 * the current {@link CartoKitDiff}, source {@link CartoKitIR}, and target {@link CartoKitIR}.
 */
export async function reconSizeDiffs(
  params: Promise<ReconFnParams>
): Promise<ReconFnResult> {
  const { diff, sourceIR, targetIR } = await params;

  switch (diff.type) {
    case 'size': {
      map.value!.setPaintProperty(
        diff.layerId,
        'circle-radius',
        diff.payload.size
      );
      break;
    }
    case 'min-size':
    case 'max-size': {
      const layer = targetIR.layers[
        diff.layerId
      ] as CartoKitProportionalSymbolLayer;

      map.value!.setPaintProperty(
        diff.layerId,
        'circle-radius',
        deriveSize(layer)
      );
      break;
    }
  }

  return {
    diff,
    sourceIR,
    targetIR
  };
}
