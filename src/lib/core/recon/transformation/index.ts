import type { GeoJSONSource } from 'maplibre-gl';

import type { ReconFnParams, ReconFnResult } from '$lib/core/recon';
import { map } from '$lib/state/map.svelte';

export async function reconTransformationDiffs(
  params: Promise<ReconFnParams>
): Promise<ReconFnResult> {
  const { diff, sourceIR, targetIR } = await params;

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
    sourceIR,
    targetIR
  };
}
