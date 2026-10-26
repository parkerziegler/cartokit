import { writable } from 'svelte/store';

import type { CartoKitIR } from '$lib/types';

/**
 * Create a fresh {@link CartoKitIR} in its initial state.
 *
 * Patches mutate the IR in place, so callers must never share an initial IR
 * object. Returning a new object on each call guarantees this.
 *
 * @returns A new {@link CartoKitIR}.
 */
export function createInitialIR(): CartoKitIR {
  return {
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
}

export const ir = writable<CartoKitIR>(createInitialIR());
