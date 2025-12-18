import { writable } from 'svelte/store';

import type { CartoKitIR } from '$lib/types';

export const ir = writable<CartoKitIR>({
  center: [-98.35, 39.5],
  zoom: 4,
  basemap: {
    url: 'https://tiles.stadiamaps.com/styles/stamen_toner_lite.json',
    provider: 'Stamen'
  },
  projection: 'mercator',
  layers: {}
});
