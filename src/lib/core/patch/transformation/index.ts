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

      if (layer.source.type === 'geojson') {
        // Derive the inverse diff prior to applying the patch.
        inverse = {
          type: 'remove-transformation',
          layerId: diff.layerId,
          payload: {
            geojson: layer.source.data,
            transformationName: diff.payload.transformation.name
          }
        };

        // Apply the patch.
        layer.source.data = diff.payload.geojson;

        const tIdx = layer.source.transformations.findIndex(
          (t) => t.name === diff.payload.transformation.name
        );
        layer.source.transformations =
          tIdx > -1
            ? [
                ...layer.source.transformations.slice(tIdx),
                diff.payload.transformation,
                ...layer.source.transformations.slice(tIdx + 1)
              ]
            : [...layer.source.transformations, diff.payload.transformation];
      }
      break;
    }
    case 'remove-transformation': {
      const layer = ir.layers[diff.layerId];

      if (layer.source.type === 'geojson') {
        // Find the transformation before removing it so we can create the inverse.
        const tIdx = layer.source.transformations.findIndex(
          (t) => t.name === diff.payload.transformationName
        );

        if (tIdx > -1) {
          const transformation = layer.source.transformations[tIdx];

          // Derive the inverse diff prior to applying the patch.
          inverse = {
            type: 'add-transformation',
            layerId: diff.layerId,
            payload: {
              geojson: layer.source.data,
              transformation
            }
          };

          // Apply the patch.
          layer.source.data = diff.payload.geojson;
          layer.source.transformations.splice(tIdx, 1);
        }
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
