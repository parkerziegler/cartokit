import type { ReconFnParams, ReconFnResult } from '#lib/core/recon/index.ts';
import { deriveSize } from '#lib/interaction/geometry.ts';
import { map } from '#lib/state/map.svelte.ts';
import type { CartoKitProportionalSymbolLayer } from '#lib/types/index.ts';

/**
 * Reconcile size-related {@link CartoKitDiff}s based on the target {@link CartoKitIR}.
 *
 * @param params A promise that resolves to the {@link ReconFnParams}, including
 * the current {@link CartoKitDiff} and target {@link CartoKitIR}.
 * @returns A promise that resolves to the {@link ReconFnResult}, including
 * the current {@link CartoKitDiff} and target {@link CartoKitIR}.
 */
export async function reconSizeDiffs(
  params: Promise<ReconFnParams>
): Promise<ReconFnResult> {
  const { diff, targetIR } = await params;

  switch (diff.type) {
    case 'size': {
      map.value!.setPaintProperty(
        diff.layerId,
        'circle-radius',
        diff.payload.size
      );
      break;
    }
    case 'size-attribute':
    case 'min-size':
    case 'max-size': {
      const layer = targetIR.layers[
        diff.layerId
      ] as CartoKitProportionalSymbolLayer;

      map.value!.setPaintProperty(
        diff.layerId,
        'circle-radius',
        deriveSize(layer.id, layer.style.size)
      );
      break;
    }
  }

  return {
    diff,
    targetIR
  };
}
