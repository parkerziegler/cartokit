import type { ReconFnParams, ReconFnResult } from '$lib/core/recon';
import { map } from '$lib/state/map.svelte';
import type { CartoKitDotDensityLayer } from '$lib/types';
import type { GeoJSONSource } from 'maplibre-gl';

/**
 * Reconcile diffs related to {@link CartoKitDotDensityLayer}.
 *
 * @param params The {@link CartoKitDiff}, the source {@link CartoKitIR}, and
 * the target {@link CartoKitIR} to reconcile.
 * @returns The {@link CartoKitDiff}, the source {@link CartoKitIR}, and the
 * target {@link CartoKitIR} after reconciliation.
 */
export async function reconDotDensityDiffs(
  params: Promise<ReconFnParams>
): Promise<ReconFnResult> {
  const { diff, sourceIR, targetIR } = await params;

  switch (diff.type) {
    case 'dot-value':
    case 'dot-attribute': {
      const layer = targetIR.layers[diff.layerId] as CartoKitDotDensityLayer;

      (map.value!.getSource(diff.layerId) as GeoJSONSource)?.setData(
        layer.data.geojson
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
