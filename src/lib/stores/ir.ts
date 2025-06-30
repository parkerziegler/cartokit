import { writable } from 'svelte/store';

import type { CartoKitIR } from '$lib/types';

export const ir = writable<CartoKitIR>({
  center: [-100.61137830408234, 33.71373105220192],
  zoom: 5.78501290258878,
  basemap: {
    url: 'https://tiles.stadiamaps.com/styles/stamen_toner_lite.json',
    provider: 'Stamen'
  },
  projection: 'mercator',
  layers: {}
});
