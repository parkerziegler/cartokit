import type { CartoKitIR } from '$lib/types';

export const ir = $state<{ value: CartoKitIR }>({
  value: {
    center: [-98.35, 39.5],
    basemap: {
      url: 'https://tiles.stadiamaps.com/styles/stamen_toner_lite.json',
      provider: 'Stamen'
    },
    zoom: 4,
    projection: 'mercator',
    layers: {}
  }
});
