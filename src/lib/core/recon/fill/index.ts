import type { ReconFnParams, ReconFnResult } from '$lib/core/recon';
import { deriveColorScale } from '$lib/interaction/color';
import { map } from '$lib/state/map.svelte';
import type {
  CartoKitChoroplethLayer,
  CartoKitDotDensityLayer,
  CartoKitPointLayer,
  CartoKitPolygonLayer,
  CartoKitProportionalSymbolLayer
} from '$lib/types';

export async function reconFillDiffs(
  params: Promise<ReconFnParams>
): Promise<ReconFnResult> {
  const { diff, sourceIR, targetIR } = await params;

  switch (diff.type) {
    case 'fill-attribute':
    case 'fill-color-scheme':
    case 'fill-color-scheme-direction':
    case 'fill-classification-method':
    case 'fill-step-count':
    case 'fill-step-value':
    case 'fill-visualization-type': {
      const layer = targetIR.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer;

      switch (layer.type) {
        case 'Choropleth':
          map.value!.setPaintProperty(
            diff.layerId,
            'fill-color',
            deriveColorScale(layer.style.fill)
          );
          break;
        case 'Point':
        case 'Proportional Symbol':
          map.value!.setPaintProperty(
            diff.layerId,
            'circle-color',
            deriveColorScale(layer.style.fill)
          );
          break;
      }
      break;
    }
    case 'fill-color': {
      const layer = targetIR.layers[diff.layerId] as
        | CartoKitDotDensityLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer
        | CartoKitPolygonLayer;

      switch (layer.type) {
        case 'Dot Density':
        case 'Point':
        case 'Proportional Symbol':
          map.value!.setPaintProperty(
            diff.layerId,
            'circle-color',
            diff.payload.color
          );
          break;
        case 'Polygon':
          map.value!.setPaintProperty(
            diff.layerId,
            'fill-color',
            diff.payload.color
          );
          break;
      }
      break;
    }
    case 'fill-opacity': {
      const layer = targetIR.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitDotDensityLayer
        | CartoKitPointLayer
        | CartoKitPolygonLayer
        | CartoKitProportionalSymbolLayer;

      switch (layer.type) {
        case 'Choropleth':
        case 'Polygon':
          map.value!.setPaintProperty(
            diff.layerId,
            'fill-opacity',
            diff.payload.opacity
          );
          break;
        case 'Dot Density':
        case 'Point':
        case 'Proportional Symbol':
          map.value!.setPaintProperty(
            diff.layerId,
            'circle-opacity',
            diff.payload.opacity
          );
          break;
      }
      break;
    }
    case 'add-fill': {
      const layer = targetIR.layers[diff.layerId] as
        | CartoKitDotDensityLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer
        | CartoKitPolygonLayer;

      switch (layer.type) {
        case 'Dot Density':
        case 'Point':
        case 'Proportional Symbol':
          map.value!.setPaintProperty(
            diff.layerId,
            'circle-color',
            deriveColorScale(layer.style.fill)
          );
          map.value!.setPaintProperty(
            diff.layerId,
            'circle-opacity',
            layer.style.fill.opacity
          );
          break;
        case 'Polygon':
          map.value!.setPaintProperty(
            diff.layerId,
            'fill-color',
            deriveColorScale(layer.style.fill)
          );
          map.value!.setPaintProperty(
            diff.layerId,
            'fill-opacity',
            layer.style.fill.opacity
          );
          break;
      }
      break;
    }
    case 'remove-fill': {
      const layer = targetIR.layers[diff.layerId] as
        | CartoKitDotDensityLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer
        | CartoKitPolygonLayer;

      switch (layer.type) {
        case 'Dot Density':
        case 'Point':
        case 'Proportional Symbol':
          map.value!.setPaintProperty(
            diff.layerId,
            'circle-color',
            'transparent'
          );
          map.value!.setPaintProperty(diff.layerId, 'circle-opacity', 0);
          break;
        case 'Polygon':
          map.value!.setPaintProperty(
            diff.layerId,
            'fill-color',
            'transparent'
          );
          map.value!.setPaintProperty(diff.layerId, 'fill-opacity', 0);
          break;
      }
      break;
    }
  }

  return {
    diff,
    sourceIR,
    targetIR
  };
}
