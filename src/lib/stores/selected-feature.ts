import { writable } from 'svelte/store';
import type { MapGeoJSONFeature } from 'maplibre-gl';

export const selectedFeature = writable<MapGeoJSONFeature | null>(null);
