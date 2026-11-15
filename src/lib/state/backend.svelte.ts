import type { CartoKitBackend } from '#lib/types/codegen.ts';

export const backend = $state<{ value: CartoKitBackend }>({
  value: {
    library: 'maplibre',
    language: 'javascript'
  }
});
