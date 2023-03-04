import { writable } from 'svelte/store';
import type { Map } from 'maplibre-gl';

export const map = writable<Map | null>(null);
