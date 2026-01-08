import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';

/**
 * Patch map-related {@link CartoKitDiff}s for the current {@link CartoKitIR}.
 *
 * @param params A promise that resolves to the {@link PatchFnParams}, including
 * the current {@link CartoKitDiff} and {@link CartoKitIR}.
 * @returns A promise that resolves to the {@link PatchFnResult}, including
 * the current {@link CartoKitDiff} and patched {@link CartoKitIR}.
 */
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
    case 'projection': {
      ir.projection = diff.payload.projection;
      break;
    }
  }

  return {
    diff,
    ir
  };
}
