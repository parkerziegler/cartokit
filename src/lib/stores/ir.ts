import { writable } from 'svelte/store';

import type { CartoKitIR } from '$lib/types';

export const initialIR: CartoKitIR = {
  center: [-98.35, 39.5],
  zoom: 4,
  pitch: 0,
  bearing: 0,
  basemap: {
    url: 'https://tiles.stadiamaps.com/styles/stamen_toner_lite.json',
    provider: 'Stamen',
    mode: 'light',
    beforeId: 'road-label'
  },
  projection: 'mercator',
  layers: {}
};

export const ir = writable<CartoKitIR>(initialIR);
