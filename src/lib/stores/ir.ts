import { writable } from 'svelte/store';

import { PUBLIC_MAPTILER_API_KEY } from '$env/static/public';
import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

export interface CartoKitIR {
  center: [number, number];
  zoom: number;
  basemap: {
    url: string;
    provider: 'Maptiler' | 'Mapbox';
  };
  layers: Record<string, CartoKitLayer>;
}

export const ir = writable<CartoKitIR>({
  center: [-105, 37],
  basemap: {
    url: `https://api.maptiler.com/maps/dataviz-light/style.json?key=${PUBLIC_MAPTILER_API_KEY}`,
    provider: 'Maptiler'
  },
  zoom: 4,
  layers: {}
});