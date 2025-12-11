import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';

export async function patchTransformationDiffs(
  params: Promise<PatchFnParams>
): Promise<PatchFnResult> {
  const { diff, ir } = await params;

  switch (diff.type) {
    case 'add-transformation': {
      const layer = ir.layers[diff.layerId];
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
      layer.data.geojson = diff.payload.geojson;

      const tIdx = layer.data.transformations.findIndex(
        (t) => t.name === diff.payload.transformationName
      );

      if (tIdx > -1) {
        layer.data.transformations.splice(tIdx, 1);
      }

      break;
    }
  }

  return {
    diff,
    ir
  };
}
