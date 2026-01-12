import type { GeoJSONSource } from 'maplibre-gl';

import type { ReconFnParams, ReconFnResult } from '$lib/core/recon';
import { map } from '$lib/state/map.svelte';

/**
 * Reconcile transformation-related {@link CartoKitDiff}s based on the target {@link CartoKitIR}.
 *
 * @param params A promise that resolves to the {@link ReconFnParams}, including
 * the current {@link CartoKitDiff} and target {@link CartoKitIR}.
 * @returns A promise that resolves to the {@link ReconFnResult}, including
 * the current {@link CartoKitDiff} and target {@link CartoKitIR}.
 */
export async function reconTransformationDiffs(
  params: Promise<ReconFnParams>
): Promise<ReconFnResult> {
  const { diff, targetIR } = await params;

  switch (diff.type) {
    case 'add-transformation':
    case 'remove-transformation': {
      // Update the source with the new data.
      (map.value!.getSource(diff.layerId) as GeoJSONSource).setData(
        diff.payload.geojson
      );
      break;
    }
  }

  return {
    diff,
    targetIR
  };
}
