import { ir } from '$lib/state/ir.svelte';
import { map } from '$lib/state/map.svelte';
import type { BasemapProvider } from '$lib/types';
import { getInstrumentedLayerIds } from '$lib/utils/layer';

/**
 * Switch the basemap of the map while preserving all currently rendered layers
 * and sources. By default, map.setStyle() will not preserve custom layers.
 * See: https://github.com/maplibre/maplibre-gl-js/issues/2587.
 *
 * @param tileUrl – The url of the new vector basemap style.
 * @param provider – The basemap provider of the new vector basemap style.
 */
export function switchBasemapWithPreservedLayers(
  tileUrl: string,
  provider: BasemapProvider
): void {
  // Update the IR with the new basemap information.
  ir.value.basemap.url = tileUrl;
  ir.value.basemap.provider = provider;

  // Preserve all currently rendered layers and sources when calling map.setStyle().
  map.value!.setStyle(tileUrl, {
    transformStyle: (previousStyle, nextStyle) => {
      const ids = Object.values(ir.value.layers).reduce<string[]>(
        (acc, layer) => [...acc, layer.id, ...getInstrumentedLayerIds(layer)],
        []
      );

      const customLayers =
        previousStyle?.layers?.filter((layer) => ids.includes(layer.id)) ?? [];
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
}
