import { writable } from 'svelte/store';
import type { MapboxGeoJSONFeature } from 'mapbox-gl';

export const selectedFeature = writable<MapboxGeoJSONFeature | null>(null);
