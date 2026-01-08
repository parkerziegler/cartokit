import type { ReconFnParams, ReconFnResult } from '$lib/core/recon';
import { map } from '$lib/state/map.svelte';
import { getInstrumentedLayerIds } from '$lib/utils/layer';

/**
 * Reconcile map-related {@link CartoKitDiff}s based on the target {@link CartoKitIR}.
 *
 * @param params A promise that resolves to the {@link ReconFnParams}, including
 * the current {@link CartoKitDiff}, source {@link CartoKitIR}, and target {@link CartoKitIR}.
 * @returns A promise that resolves to the {@link ReconFnResult}, including
 * the current {@link CartoKitDiff}, source {@link CartoKitIR}, and target {@link CartoKitIR}.
 */
export async function reconMapDiffs(
  params: Promise<ReconFnParams>
): Promise<ReconFnResult> {
  const { diff, sourceIR, targetIR } = await params;

  switch (diff.type) {
    case 'basemap': {
      // Preserve all currently rendered layers and sources when calling map.setStyle().
      // By default, map.setStyle() will not preserve custom layers.
      // See: https://github.com/maplibre/maplibre-gl-js/issues/2587.
      map.value!.setStyle(diff.payload.url, {
        transformStyle: (previousStyle, nextStyle) => {
          const ids = Object.values(targetIR.layers).reduce<string[]>(
            (acc, layer) => [
              ...acc,
              layer.id,
              ...getInstrumentedLayerIds(layer)
            ],
            []
          );

          const customLayers =
            previousStyle?.layers?.filter((layer) => ids.includes(layer.id)) ??
            [];
          const layers = nextStyle.layers.concat(customLayers);

          const sources = nextStyle.sources;
          if (previousStyle?.sources) {
            for (const [id, value] of Object.entries(previousStyle.sources)) {
              if (ids.includes(id)) {
                sources[id] = value;
              }
            }
          }

          return { ...nextStyle, layers, sources };
        }
      });
      break;
    }
    case 'zoom': {
      map.value!.setZoom(diff.payload.zoom);
      break;
    }
    case 'center': {
      map.value!.setCenter(diff.payload.center);
      break;
    }
    case 'projection': {
      map.value!.setProjection({ type: diff.payload.projection });
      break;
    }
  }

  return {
    diff,
    sourceIR,
    targetIR
  };
}
