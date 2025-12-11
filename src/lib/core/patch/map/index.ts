import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';

export async function patchMapDiffs(
  params: Promise<PatchFnParams>
): Promise<PatchFnResult> {
  const { diff, ir } = await params;

  switch (diff.type) {
    case 'basemap': {
      ir.basemap.url = diff.payload.url;
      ir.basemap.provider = diff.payload.provider;
      break;
    }
    case 'zoom': {
      ir.zoom = diff.payload.zoom;
      break;
    }
    case 'center': {
      ir.center = [diff.payload.center.lng, diff.payload.center.lat];
      break;
    }
  }

  return {
    diff,
    ir
  };
}
