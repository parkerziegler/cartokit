import type { CartoKitDiff } from '$lib/core/diff';
import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';

/**
 * Patch transformation-related {@link CartoKitDiff}s for the current {@link CartoKitIR}.
 *
 * @param params A promise that resolves to the {@link PatchFnParams}, including
 * the current {@link CartoKitDiff} and {@link CartoKitIR}.
 * @returns A promise that resolves to the {@link PatchFnResult}, including
 * the current {@link CartoKitDiff} and patched {@link CartoKitIR}.
 */
export async function patchTransformationDiffs(
  params: Promise<PatchFnParams>
): Promise<PatchFnResult> {
  const { diff, ir, inverseDiff } = await params;

  let inverse: CartoKitDiff = inverseDiff;

  switch (diff.type) {
    case 'add-transformation': {
      const layer = ir.layers[diff.layerId];

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'remove-transformation',
        layerId: diff.layerId,
        payload: {
          geojson: layer.data.geojson,
          transformationName: diff.payload.transformation.name
        }
      };

      // Apply the patch.
      layer.data.geojson = diff.payload.geojson;

      const tIdx = layer.data.transformations.findIndex(
        (t) => t.name === diff.payload.transformation.name
      );
      layer.data.transformations =
        tIdx > -1
          ? [
              ...layer.data.transformations.slice(tIdx),
              diff.payload.transformation,
              ...layer.data.transformations.slice(tIdx + 1)
            ]
          : [...layer.data.transformations, diff.payload.transformation];

      break;
    }
    case 'remove-transformation': {
      const layer = ir.layers[diff.layerId];

      // Find the transformation before removing it so we can create the inverse.
      const tIdx = layer.data.transformations.findIndex(
        (t) => t.name === diff.payload.transformationName
      );

      if (tIdx > -1) {
        const transformation = layer.data.transformations[tIdx];

        // Derive the inverse diff prior to applying the patch.
        inverse = {
          type: 'add-transformation',
          layerId: diff.layerId,
          payload: {
            geojson: layer.data.geojson,
            transformation
          }
        };

        // Apply the patch.
        layer.data.geojson = diff.payload.geojson;
        layer.data.transformations.splice(tIdx, 1);
      }

      break;
    }
  }

  return {
    diff,
    ir,
    inverseDiff: inverse
  };
}
