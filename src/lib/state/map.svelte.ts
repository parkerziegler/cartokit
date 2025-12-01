import type { Map } from 'maplibre-gl';

export const map = $state<{ value: Map | undefined }>({ value: undefined });
