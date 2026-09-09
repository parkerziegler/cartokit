import { writable } from 'svelte/store';

import type { CartoKitBackend } from '$lib/types/codegen';

export const backend = writable<CartoKitBackend>({
  library: 'maplibre',
  language: 'javascript'
});
