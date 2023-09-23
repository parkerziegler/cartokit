import { writable } from 'svelte/store';

import type { CartoKitLayer } from '$lib/types/CartoKitLayer';
import type { BasemapProvider } from '$lib/utils/basemap';

export interface CartoKitIR {
  center: [number, number];
  zoom: number;
  basemap: {
    url: string;
    provider: BasemapProvider;
  };
  layers: Record<string, CartoKitLayer>;
}

export const ir = writable<CartoKitIR>({
  center: [-105, 37],
  basemap: {
    url: 'https://tiles.stadiamaps.com/styles/alidade_smooth.json',
    provider: 'Stadia Maps'
  },
  zoom: 4,
  layers: {}
});
