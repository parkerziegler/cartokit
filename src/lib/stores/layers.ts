import { writable } from 'svelte/store';

import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

export type CartoKitIR = Record<string, CartoKitLayer>;
export const layers = writable<CartoKitIR>({});
