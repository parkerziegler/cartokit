import type maplibregl from 'maplibre-gl';
import { SvelteMap } from 'svelte/reactivity';

type LayerListener = (event: maplibregl.MapLayerMouseEvent) => void;

export interface LayerListeners {
  click: LayerListener;
  mousemove: LayerListener;
  mouseleave: LayerListener;
}

export const listeners = $state<{ value: SvelteMap<string, LayerListeners> }>({
  value: new SvelteMap()
});
