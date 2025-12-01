import type { MapGeoJSONFeature } from 'maplibre-gl';

export const feature = $state<{ value: MapGeoJSONFeature | null }>({
  value: null
});
