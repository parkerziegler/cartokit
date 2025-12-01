import type { CartoKitBackend } from '$lib/types';

export const backend = $state<{ value: CartoKitBackend }>({
  value: {
    library: 'maplibre',
    language: 'javascript'
  }
});
