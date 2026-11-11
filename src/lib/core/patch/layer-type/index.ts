import type { CartoKitDiff } from '$lib/core/diff';
import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';
import { patchChoropleth } from '$lib/core/patch/layer-type/choropleth';
import { patchHeatmap } from '$lib/core/patch/layer-type/heatmap';
import { patchPoint } from '$lib/core/patch/layer-type/point';
import { patchPolygon } from '$lib/core/patch/layer-type/polygon';
import { patchProportionalSymbol } from '$lib/core/patch/layer-type/proportional-symbol';
import type {
  CartoKitChoroplethLayer,
  CartoKitHeatmapLayer,
  CartoKitPointLayer,
  CartoKitPolygonLayer,
  CartoKitProportionalSymbolLayer
} from '$lib/types';

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
          ir.layers[diff.layerId] = patchChoropleth(
            sourceLayer as CartoKitPolygonLayer
          );
          break;
        case 'Heatmap':
          ir.layers[diff.layerId] = patchHeatmap(
            sourceLayer as CartoKitPointLayer | CartoKitProportionalSymbolLayer
          );
          break;
        case 'Point':
          ir.layers[diff.layerId] = patchPoint(
            sourceLayer as
              CartoKitHeatmapLayer | CartoKitProportionalSymbolLayer
          );
          break;
        case 'Polygon':
          ir.layers[diff.layerId] = patchPolygon(
            sourceLayer as CartoKitChoroplethLayer
          );
          break;
        case 'Proportional Symbol':
          ir.layers[diff.layerId] = patchProportionalSymbol(
            sourceLayer as CartoKitHeatmapLayer | CartoKitPointLayer
          );
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
