import { get } from 'svelte/store';

import { ir as irStore } from '$lib/stores/ir';
import { map as mapStore } from '$lib/stores/map';
import type { BasemapProvider } from '$lib/utils/basemap';
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
  irStore.update((ir) => {
    ir.basemap.url = tileUrl;
    ir.basemap.provider = provider;

    return ir;
  });

  // Preserve all currently rendered layers and sources when calling map.setStyle().
  const ir = get(irStore);
  const map = get(mapStore);

  map.setStyle(tileUrl, {
    transformStyle: (previousStyle, nextStyle) => {
      const ids = Object.values(ir.layers).reduce<string[]>(
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
