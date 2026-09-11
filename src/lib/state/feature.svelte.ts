import type { Feature } from 'geojson';

export const feature = $state<{
  value:
    | (Feature & { layerId: string; sourceId: string; sourceLayerId?: string })
    | null;
}>({
  value: null
});
