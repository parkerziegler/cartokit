import type maplibregl from 'maplibre-gl';
import { SvelteMap } from 'svelte/reactivity';

type LayerListener = (event: maplibregl.MapLayerMouseEvent) => void;

/**
 * The listeners registered for a layer, keyed by event.
 *
 * Hover and select instrument layers independently, and detach independently,
 * so a layer can hold either set on its own.
 */
export interface LayerListeners {
  click?: LayerListener;
  mousemove?: LayerListener;
  mouseleave?: LayerListener;
}

export const listeners = $state<{ value: SvelteMap<string, LayerListeners> }>({
  value: new SvelteMap()
});
