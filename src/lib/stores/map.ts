import { writable } from 'svelte/store';
import type { Map } from 'mapbox-gl';

export const map = writable<Map | null>(null);
