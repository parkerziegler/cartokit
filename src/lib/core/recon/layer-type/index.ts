import type { ReconFnParams, ReconFnResult } from '$lib/core/recon';
import { reconChoropleth } from '$lib/core/recon/layer-type/choropleth';
import { reconHeatmap } from '$lib/core/recon/layer-type/heatmap';
import { reconPoint } from '$lib/core/recon/layer-type/point';
import { reconPolygon } from '$lib/core/recon/layer-type/polygon';
import { reconProportionalSymbol } from '$lib/core/recon/layer-type/proportional-symbol';
import type {
  CartoKitChoroplethLayer,
  CartoKitHeatmapLayer,
  CartoKitPointLayer,
  CartoKitPolygonLayer,
  CartoKitProportionalSymbolLayer
} from '$lib/types';

/**
 * Reconcile layer type-related {@link CartoKitDiff}s based on the target {@link CartoKitIR}.
 *
 * @param params A promise that resolves to the {@link ReconFnParams}, including
 * the current {@link CartoKitDiff} and target {@link CartoKitIR}.
 * @returns A promise that resolves to the {@link ReconFnResult}, including
 * the current {@link CartoKitDiff} and target {@link CartoKitIR}.
 */
export async function reconLayerTypeDiffs(
  params: Promise<ReconFnParams>
): Promise<ReconFnResult> {
  const { diff, targetIR } = await params;

  switch (diff.type) {
    case 'layer-type': {
      switch (diff.payload.targetLayerType) {
        case 'Choropleth': {
          reconChoropleth(
            diff.layerId,
            diff.payload.sourceLayerType as 'Polygon',
            targetIR.layers[diff.layerId] as CartoKitChoroplethLayer
          );
          break;
        }
        case 'Heatmap': {
          reconHeatmap(
            diff.layerId,
            diff.payload.sourceLayerType as 'Point' | 'Proportional Symbol',
            targetIR.layers[diff.layerId] as CartoKitHeatmapLayer
          );
          break;
        }
        case 'Point': {
          reconPoint(
            diff.layerId,
            diff.payload.sourceLayerType as 'Heatmap' | 'Proportional Symbol',
            targetIR.layers[diff.layerId] as CartoKitPointLayer
          );
          break;
        }
        case 'Polygon': {
          reconPolygon(
            diff.layerId,
            diff.payload.sourceLayerType as 'Choropleth',
            targetIR.layers[diff.layerId] as CartoKitPolygonLayer
          );
          break;
        }
        case 'Proportional Symbol': {
          reconProportionalSymbol(
            diff.layerId,
            diff.payload.sourceLayerType as 'Heatmap' | 'Point',
            targetIR.layers[diff.layerId] as CartoKitProportionalSymbolLayer
          );
          break;
        }
      }
    }
  }

  return {
    diff,
    targetIR
  };
}
