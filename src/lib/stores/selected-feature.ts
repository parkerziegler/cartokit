import type { MapGeoJSONFeature } from 'maplibre-gl';
import { writable } from 'svelte/store';

export const selectedFeature = writable<MapGeoJSONFeature | null>(null);
