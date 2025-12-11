import type { ReconFnParams, ReconFnResult } from '$lib/core/recon';
import { map } from '$lib/state/map.svelte';
import type {
  CartoKitChoroplethLayer,
  CartoKitLineLayer,
  CartoKitPointLayer,
  CartoKitPolygonLayer,
  CartoKitProportionalSymbolLayer
} from '$lib/types';

export async function reconStrokeDiffs(
  params: Promise<ReconFnParams>
): Promise<ReconFnResult> {
  const { diff, sourceIR, targetIR } = await params;

  switch (diff.type) {
    case 'stroke-color': {
      const layer = targetIR.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitLineLayer
        | CartoKitPointLayer
        | CartoKitPolygonLayer
        | CartoKitProportionalSymbolLayer;

      switch (layer.type) {
        case 'Choropleth':
        case 'Polygon':
          map.value!.setPaintProperty(
            `${diff.layerId}-stroke`,
            'line-color',
            diff.payload.color
          );
          break;
        case 'Point':
        case 'Proportional Symbol':
          map.value!.setPaintProperty(
            diff.layerId,
            'circle-stroke-color',
            diff.payload.color
          );
          break;
        case 'Line':
          map.value!.setPaintProperty(
            diff.layerId,
            'line-color',
            diff.payload.color
          );
          break;
      }
      break;
    }
    case 'stroke-width': {
      const layer = targetIR.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitLineLayer
        | CartoKitPointLayer
        | CartoKitPolygonLayer
        | CartoKitProportionalSymbolLayer;

      switch (layer.type) {
        case 'Point':
        case 'Proportional Symbol':
          map.value!.setPaintProperty(
            diff.layerId,
            'circle-stroke-width',
            diff.payload.strokeWidth
          );
          break;
        case 'Line':
          map.value!.setPaintProperty(
            diff.layerId,
            'line-width',
            diff.payload.strokeWidth
          );
          break;
        case 'Polygon':
        case 'Choropleth':
          map.value!.setPaintProperty(
            `${diff.layerId}-stroke`,
            'line-width',
            diff.payload.strokeWidth
          );
          break;
      }
      break;
    }
    case 'stroke-opacity': {
      const layer = targetIR.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitLineLayer
        | CartoKitPointLayer
        | CartoKitPolygonLayer
        | CartoKitProportionalSymbolLayer;

      switch (layer.type) {
        case 'Choropleth':
        case 'Polygon':
          map.value!.setPaintProperty(
            `${diff.layerId}-stroke`,
            'line-opacity',
            diff.payload.opacity
          );
          break;
        case 'Point':
        case 'Proportional Symbol':
          map.value!.setPaintProperty(
            diff.layerId,
            'circle-stroke-opacity',
            diff.payload.opacity
          );
          break;
        case 'Line':
          map.value!.setPaintProperty(
            diff.layerId,
            'line-opacity',
            diff.payload.opacity
          );
          break;
      }
      break;
    }
    case 'add-stroke': {
      const layer = targetIR.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitPolygonLayer
        | CartoKitProportionalSymbolLayer;

      switch (layer.type) {
        case 'Choropleth':
        case 'Polygon':
          map.value!.setPaintProperty(
            `${diff.layerId}-stroke`,
            'line-opacity',
            layer.style.stroke.opacity
          );
          break;
        case 'Point':
        case 'Proportional Symbol':
          map.value!.setPaintProperty(
            diff.layerId,
            'circle-stroke-opacity',
            layer.style.stroke.opacity
          );
          break;
      }
      break;
    }
    case 'remove-stroke': {
      const layer = targetIR.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitPolygonLayer
        | CartoKitProportionalSymbolLayer;

      switch (layer.type) {
        case 'Choropleth':
        case 'Polygon':
          map.value!.setPaintProperty(
            `${diff.layerId}-stroke`,
            'line-opacity',
            0
          );
          break;
        case 'Point':
        case 'Proportional Symbol':
          map.value!.setPaintProperty(diff.layerId, 'circle-stroke-opacity', 0);
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
