import type { CartoKitDiff } from '$lib/core/diff';
import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';
import { patchChoropleth } from '$lib/core/patch/layer-type/choropleth';
import { patchDotDensity } from '$lib/core/patch/layer-type/dot-density';
import { patchHeatmap } from '$lib/core/patch/layer-type/heatmap';
import { patchLine } from '$lib/core/patch/layer-type/line';
import { patchPoint } from '$lib/core/patch/layer-type/point';
import { patchPolygon } from '$lib/core/patch/layer-type/polygon';
import { patchProportionalSymbol } from '$lib/core/patch/layer-type/proportional-symbol';

/**
 * Patch layer-type-related {@link CartoKitDiff}s for the current {@link CartoKitIR}.
 *
 * @param params A promise that resolves to the {@link PatchFnParams}, including
 * the current {@link CartoKitDiff} and {@link CartoKitIR}.
 * @returns A promise that resolves to the {@link PatchFnResult}, including
 * the current {@link CartoKitDiff} and patched {@link CartoKitIR}.
 */
export async function patchLayerTypeDiffs(
  params: Promise<PatchFnParams>
): Promise<PatchFnResult> {
  const { diff, ir, inverseDiff } = await params;

  let inverse: CartoKitDiff = inverseDiff;

  switch (diff.type) {
    case 'layer-type': {
      const sourceLayer = ir.layers[diff.layerId];

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'layer-type',
        layerId: diff.layerId,
        payload: {
          sourceLayerType: diff.payload.targetLayerType,
          targetLayerType: sourceLayer.type
        }
      };

      // Apply the patch.
      switch (diff.payload.targetLayerType) {
        case 'Choropleth':
          ir.layers[diff.layerId] = patchChoropleth(sourceLayer);
          break;
        case 'Dot Density':
          ir.layers[diff.layerId] = patchDotDensity(sourceLayer);
          break;
        case 'Heatmap':
          ir.layers[diff.layerId] = patchHeatmap(sourceLayer);
          break;
        case 'Line':
          ir.layers[diff.layerId] = patchLine(sourceLayer);
          break;
        case 'Point':
          ir.layers[diff.layerId] = patchPoint(sourceLayer);
          break;
        case 'Polygon':
          ir.layers[diff.layerId] = patchPolygon(sourceLayer);
          break;
        case 'Proportional Symbol':
          ir.layers[diff.layerId] = patchProportionalSymbol(sourceLayer);
          break;
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
