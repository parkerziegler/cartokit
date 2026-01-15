import type { ReconFnParams, ReconFnResult } from '$lib/core/recon';
import { map } from '$lib/state/map.svelte';
import type {
  CartoKitChoroplethLayer,
  CartoKitDotDensityLayer,
  CartoKitLineLayer,
  CartoKitPointLayer,
  CartoKitPolygonLayer,
  CartoKitProportionalSymbolLayer
} from '$lib/types';

/**
 * Reconcile stroke-related {@link CartoKitDiff}s based on the target {@link CartoKitIR}.
 *
 * @param params A promise that resolves to the {@link ReconFnParams}, including
 * the current {@link CartoKitDiff} and target {@link CartoKitIR}.
 * @returns A promise that resolves to the {@link ReconFnResult}, including
 * the current {@link CartoKitDiff} and target {@link CartoKitIR}.
 */
export async function reconStrokeDiffs(
  params: Promise<ReconFnParams>
): Promise<ReconFnResult> {
  const { diff, targetIR } = await params;

  switch (diff.type) {
    case 'stroke-color': {
      const layer = targetIR.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitDotDensityLayer
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
        case 'Dot Density':
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
        | CartoKitDotDensityLayer
        | CartoKitLineLayer
        | CartoKitPointLayer
        | CartoKitPolygonLayer
        | CartoKitProportionalSymbolLayer;

      switch (layer.type) {
        case 'Choropleth':
        case 'Polygon':
          map.value!.setPaintProperty(
            `${diff.layerId}-stroke`,
            'line-width',
            diff.payload.strokeWidth
          );
          break;
        case 'Dot Density':
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
      }
      break;
    }
    case 'stroke-opacity': {
      const layer = targetIR.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitDotDensityLayer
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
        case 'Dot Density':
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
        | CartoKitDotDensityLayer
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
        case 'Dot Density':
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
        | CartoKitDotDensityLayer
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
        case 'Dot Density':
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
    targetIR
  };
}
