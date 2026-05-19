import type { Feature } from 'geojson';

export const feature = $state<{
  value: (Feature & { layerId: string }) | null;
}>({
  value: null
});
