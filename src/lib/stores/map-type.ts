import { writable } from 'svelte/store';

import type { MapType } from '$lib/types/MapTypes';

export const mapType = writable<MapType>('Fill');
