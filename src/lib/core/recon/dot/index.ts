import type { ReconFnParams, ReconFnResult } from '$lib/core/recon';
import { map } from '$lib/state/map.svelte';
import type { CartoKitDotDensityLayer } from '$lib/types';
import type { GeoJSONSource } from 'maplibre-gl';

/**
 * Reconcile dot-related {@link CartoKitDiff}s based on the target {@link CartoKitIR}.
 *
 * @param params A promise that resolves to the {@link ReconFnParams}, including
 * the current {@link CartoKitDiff}, source {@link CartoKitIR}, and target {@link CartoKitIR}.
 * @returns A promise that resolves to the {@link ReconFnResult}, including
 * the current {@link CartoKitDiff}, source {@link CartoKitIR}, and target {@link CartoKitIR}.
 */
export async function reconDotDensityDiffs(
  params: Promise<ReconFnParams>
): Promise<ReconFnResult> {
  const { diff, sourceIR, targetIR } = await params;

  switch (diff.type) {
    case 'dot-value':
    case 'dot-attribute': {
      const layer = targetIR.layers[diff.layerId] as CartoKitDotDensityLayer;

      // The patch operation will have already updated the layer's GeoJSON data.
      // Reconciliation only needs to update the source data on the map.
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
