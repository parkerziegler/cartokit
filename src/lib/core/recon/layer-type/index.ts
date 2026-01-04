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
 * Reconcile the 'layer-type' diff. This function is pipelined with other
 * reconciliation functions; thus, it simply forwards its parameters in the
 * return value, which become parameters for the next function in the pipeline.
 *
 * @param params The diff, sourceIR, and targetIR to reconcile.
 * @returns The diff, sourceIR, and targetIR after reconciliation.
 */
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
        case 'Dot Density': {
          reconDotDensity(
            sourceIR.layers[diff.layerId],
            targetIR.layers[diff.layerId] as CartoKitDotDensityLayer
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
