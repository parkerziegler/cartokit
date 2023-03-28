import type { MapLayerMouseEvent } from 'maplibre-gl';
import { writable } from 'svelte/store';

type LayerListener = (event: MapLayerMouseEvent) => void;

export interface LayerListeners {
  click: LayerListener;
  mousemove: LayerListener;
  mouseleave: LayerListener;
}

export const listeners = writable<Map<string, LayerListeners>>(new Map());
