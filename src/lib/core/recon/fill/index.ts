import type { ReconFnParams, ReconFnResult } from '$lib/core/recon';
import { deriveColorScale } from '$lib/interaction/color';
import { map } from '$lib/state/map.svelte';
import type {
  CartoKitChoroplethLayer,
  CartoKitPointLayer,
  CartoKitPolygonLayer,
  CartoKitProportionalSymbolLayer
} from '$lib/types';

export function reconFillDiffs({
  diff,
  sourceIR,
  targetIR
}: ReconFnParams): ReconFnResult {
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
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer
        | CartoKitPolygonLayer;

      switch (layer.type) {
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
        | CartoKitPointLayer
        | CartoKitPolygonLayer
        | CartoKitProportionalSymbolLayer;

      switch (layer.type) {
        case 'Point':
        case 'Proportional Symbol':
          map.value!.setPaintProperty(
            diff.layerId,
            'circle-opacity',
            diff.payload.opacity
          );
          break;
        case 'Polygon':
        case 'Choropleth':
          map.value!.setPaintProperty(
            diff.layerId,
            'fill-opacity',
            diff.payload.opacity
          );
          break;
      }
      break;
    }
    case 'add-fill': {
      const layer = targetIR.layers[diff.layerId] as
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer
        | CartoKitPolygonLayer;

      switch (layer.type) {
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
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer
        | CartoKitPolygonLayer;

      switch (layer.type) {
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
