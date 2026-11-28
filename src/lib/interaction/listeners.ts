import type { Map } from 'maplibre-gl';

import { listeners, type LayerListeners } from '#lib/state/listeners.svelte.ts';

/**
 * Detach the event listeners registered for a set of layers.
 *
 * @param map The top-level {@link Map} instance.
 * @param layerIds The ids of the layers to detach listeners from.
 */
export function removeLayerListeners(map: Map, layerIds: string[]): void {
  layerIds.forEach((layerId) => {
    Object.entries(listeners.value.get(layerId) ?? {}).forEach(
      ([event, listener]) => {
        map.off(event as keyof LayerListeners, layerId, listener);
      }
    );

    listeners.value.delete(layerId);
  });
}
