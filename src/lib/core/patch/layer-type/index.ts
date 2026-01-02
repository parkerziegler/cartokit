import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';
import { patchChoropleth } from '$lib/core/patch/layer-type/choropleth';
import { patchDotDensity } from '$lib/core/patch/layer-type/dot-density';
import { patchHeatmap } from '$lib/core/patch/layer-type/heatmap';
import { patchLine } from '$lib/core/patch/layer-type/line';
import { patchPoint } from '$lib/core/patch/layer-type/point';
import { patchPolygon } from '$lib/core/patch/layer-type/polygon';
import { patchProportionalSymbol } from '$lib/core/patch/layer-type/proportional-symbol';
import type { CartoKitLayer } from '$lib/types';

export async function patchLayerTypeDiffs(
  params: Promise<PatchFnParams>
): Promise<PatchFnResult> {
  const { diff, ir } = await params;

  let targetLayer: CartoKitLayer;

  switch (diff.type) {
    case 'layer-type': {
      const sourceLayer = ir.layers[diff.layerId];

      switch (diff.payload.layerType) {
        case 'Choropleth':
          targetLayer = patchChoropleth(sourceLayer);
          break;
        case 'Dot Density':
          targetLayer = patchDotDensity(sourceLayer);
          break;
        case 'Heatmap':
          targetLayer = patchHeatmap(sourceLayer);
          break;
        case 'Line':
          targetLayer = patchLine(sourceLayer);
          break;
        case 'Point':
          targetLayer = patchPoint(sourceLayer);
          break;
        case 'Polygon':
          targetLayer = patchPolygon(sourceLayer);
          break;
        case 'Proportional Symbol':
          targetLayer = patchProportionalSymbol(sourceLayer);
          break;
      }

      return {
        diff,
        ir: {
          ...ir,
          layers: {
            ...ir.layers,
            [diff.layerId]: targetLayer
          }
        }
      };
    }
  }

  return {
    diff,
    ir
  };
}
