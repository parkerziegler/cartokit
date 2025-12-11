import type { ReconFnParams, ReconFnResult } from '$lib/core/recon';
import { reconChoropleth } from '$lib/core/recon/layer-type/choropleth';
import { reconHeatmap } from '$lib/core/recon/layer-type/heatmap';
import { reconLine } from '$lib/core/recon/layer-type/line';
import { reconPoint } from '$lib/core/recon/layer-type/point';
import { reconPolygon } from '$lib/core/recon/layer-type/polygon';
import { reconProportionalSymbol } from '$lib/core/recon/layer-type/proportional-symbol';
import type {
  CartoKitChoroplethLayer,
  CartoKitHeatmapLayer,
  CartoKitLineLayer,
  CartoKitPointLayer,
  CartoKitPolygonLayer,
  CartoKitProportionalSymbolLayer
} from '$lib/types';

export async function reconLayerTypeDiffs(
  params: Promise<ReconFnParams>
): Promise<ReconFnResult> {
  const { diff, sourceIR, targetIR } = await params;

  switch (diff.type) {
    case 'layer-type': {
      switch (diff.payload.layerType) {
        case 'Choropleth': {
          reconChoropleth(
            sourceIR.layers[diff.layerId],
            targetIR.layers[diff.layerId] as CartoKitChoroplethLayer
          );
          break;
        }
        case 'Heatmap': {
          reconHeatmap(
            sourceIR.layers[diff.layerId],
            targetIR.layers[diff.layerId] as CartoKitHeatmapLayer
          );
          break;
        }
        case 'Line': {
          reconLine(
            sourceIR.layers[diff.layerId],
            targetIR.layers[diff.layerId] as CartoKitLineLayer
          );
          break;
        }
        case 'Point': {
          reconPoint(
            sourceIR.layers[diff.layerId],
            targetIR.layers[diff.layerId] as CartoKitPointLayer
          );
          break;
        }
        case 'Polygon': {
          reconPolygon(
            sourceIR.layers[diff.layerId],
            targetIR.layers[diff.layerId] as CartoKitPolygonLayer
          );
          break;
        }
        case 'Proportional Symbol': {
          reconProportionalSymbol(
            sourceIR.layers[diff.layerId],
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
    sourceIR,
    targetIR
  };
}
