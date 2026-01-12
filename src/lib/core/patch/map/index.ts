import type { CartoKitDiff } from '$lib/core/diff';
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
  const { diff, ir, inverseDiff } = await params;

  let inverse: CartoKitDiff = inverseDiff;

  switch (diff.type) {
    case 'basemap': {
      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'basemap',
        payload: {
          url: ir.basemap.url,
          provider: ir.basemap.provider
        }
      };

      // Apply the patch.
      ir.basemap.url = diff.payload.url;
      ir.basemap.provider = diff.payload.provider;
      break;
    }
    case 'zoom': {
      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'zoom',
        payload: {
          zoom: ir.zoom
        }
      };

      // Apply the patch.
      ir.zoom = diff.payload.zoom;
      break;
    }
    case 'center': {
      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'center',
        payload: {
          center: {
            lng: ir.center[0],
            lat: ir.center[1]
          }
        }
      };

      // Apply the patch.
      ir.center = [diff.payload.center.lng, diff.payload.center.lat];
      break;
    }
    case 'projection': {
      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'projection',
        payload: {
          projection: ir.projection
        }
      };

      // Apply the patch.
      ir.projection = diff.payload.projection;
      break;
    }
  }

  return {
    diff,
    ir,
    inverseDiff: inverse
  };
}
