import type { ReconFnParams, ReconFnResult } from '$lib/core/recon';
import { map } from '$lib/state/map.svelte';
import { switchBasemapWithPreservedLayers } from '$lib/utils/maplibre';

export async function reconMapDiffs(
  params: Promise<ReconFnParams>
): Promise<ReconFnResult> {
  const { diff, sourceIR, targetIR } = await params;

  switch (diff.type) {
    case 'basemap': {
      switchBasemapWithPreservedLayers(diff.payload.url, diff.payload.provider);
      break;
    }
    case 'zoom': {
      map.value!.setZoom(diff.payload.zoom);
      break;
    }
    case 'center': {
      map.value!.setCenter(diff.payload.center);
      break;
    }
  }

  return {
    diff,
    sourceIR,
    targetIR
  };
}
