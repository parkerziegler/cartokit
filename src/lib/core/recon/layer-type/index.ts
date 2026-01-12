import type { ReconFnParams, ReconFnResult } from '$lib/core/recon';
import { reconChoropleth } from '$lib/core/recon/layer-type/choropleth';
import { reconDotDensity } from '$lib/core/recon/layer-type/dot-density';
import { reconHeatmap } from '$lib/core/recon/layer-type/heatmap';
import { reconLine } from '$lib/core/recon/layer-type/line';
import { reconPoint } from '$lib/core/recon/layer-type/point';
import { reconPolygon } from '$lib/core/recon/layer-type/polygon';
import { reconProportionalSymbol } from '$lib/core/recon/layer-type/proportional-symbol';
import type {
  CartoKitChoroplethLayer,
  CartoKitDotDensityLayer,
  CartoKitHeatmapLayer,
  CartoKitLineLayer,
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
            diff.payload.sourceLayerType,
            targetIR.layers[diff.layerId] as CartoKitChoroplethLayer
          );
          break;
        }
        case 'Dot Density': {
          reconDotDensity(
            diff.layerId,
            diff.payload.sourceLayerType,
            targetIR.layers[diff.layerId] as CartoKitDotDensityLayer
          );
          break;
        }
        case 'Heatmap': {
          reconHeatmap(
            diff.layerId,
            diff.payload.sourceLayerType,
            targetIR.layers[diff.layerId] as CartoKitHeatmapLayer
          );
          break;
        }
        case 'Line': {
          reconLine(
            diff.layerId,
            diff.payload.sourceLayerType,
            targetIR.layers[diff.layerId] as CartoKitLineLayer
          );
          break;
        }
        case 'Point': {
          reconPoint(
            diff.layerId,
            diff.payload.sourceLayerType,
            targetIR.layers[diff.layerId] as CartoKitPointLayer
          );
          break;
        }
        case 'Polygon': {
          reconPolygon(
            diff.layerId,
            diff.payload.sourceLayerType,
            targetIR.layers[diff.layerId] as CartoKitPolygonLayer
          );
          break;
        }
        case 'Proportional Symbol': {
          reconProportionalSymbol(
            diff.layerId,
            diff.payload.sourceLayerType,
            targetIR.layers[diff.layerId] as CartoKitProportionalSymbolLayer
          );
          break;
        }
        default:
          break;
      }
    }
  }

  return {
    diff,
    targetIR
  };
}
