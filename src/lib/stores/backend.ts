import { writable } from 'svelte/store';

import type { CartoKitBackend } from '$lib/types';

export const backend = writable<CartoKitBackend>({
  library: 'maplibre',
  language: 'javascript'
});
