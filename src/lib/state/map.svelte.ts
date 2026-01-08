import type maplibregl from 'maplibre-gl';

export const map = $state<{ value: maplibregl.Map | undefined }>({
  value: undefined
});
