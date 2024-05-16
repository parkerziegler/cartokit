import type { StyleSpecification } from 'maplibre-gl';
import { writable } from 'svelte/store';

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

export const ir = writable<CartoKitIR>({
  center: [-98.35, 39.5],
  basemap: {
    url: 'https://tiles.stadiamaps.com/styles/stamen_toner_lite.json',
    provider: 'Stamen'
  },
  zoom: 4,
  layers: {}
});
