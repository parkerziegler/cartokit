import type { CartoKitBackend } from '$lib/types/codegen';

export const backend = $state<{ value: CartoKitBackend }>({
  value: {
    library: 'maplibre',
    language: 'javascript'
  }
});
