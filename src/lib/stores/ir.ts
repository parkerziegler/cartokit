import { writable } from 'svelte/store';

import type { CartoKitIR } from '$lib/types';

export const ir = writable<CartoKitIR>({
  center: [-98.35, 39.5],
  basemap: {
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    provider: 'Stamen'
  },
  zoom: 4,
  projection: 'mercator',
  layers: {}
});
