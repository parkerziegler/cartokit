import type { Feature } from 'geojson';

export const feature = $state<{
  value: (Feature & { layerId: string; sourceLayerId?: string }) | null;
}>({
  value: null
});
