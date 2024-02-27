import type { Map } from 'maplibre-gl';
import { writable } from 'svelte/store';

export const map = writable<Map>();
