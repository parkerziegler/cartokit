import type { StyleSpecification } from 'maplibre-gl';
import { writable } from 'svelte/store';

// eslint-disable-next-line import/no-unresolved
import { PUBLIC_MAPTILER_API_KEY } from '$env/static/public';
import type { CartoKitLayer } from '$lib/types/CartoKitLayer';
import type { BasemapProvider } from '$lib/utils/basemap';

export interface CartoKitIR {
  center: [number, number];
  zoom: number;
  basemap: {
    url: string;
    json?: StyleSpecification;
    provider: BasemapProvider;
  };
  layers: Record<string, CartoKitLayer>;
}

console.log(import.meta.env);

export const ir = writable<CartoKitIR>({
  center: [-98.35, 39.5],
  basemap: {
    url: import.meta.env.BASE_URL.includes('vercel.app')
      ? `https://api.maptiler.com/maps/dataviz-light/style.json?key=${PUBLIC_MAPTILER_API_KEY}`
      : 'https://tiles.stadiamaps.com/styles/stamen_toner_lite.json',
    provider: import.meta.env.BASE_URL.includes('vercel.app')
      ? 'MapTiler'
      : 'Stamen'
  },
  zoom: 4,
  layers: {}
});
