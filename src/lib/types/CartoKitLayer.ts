import type { MapType } from './MapTypes';

export interface CartoKitLayer {
	id: string;
	displayName: string;
	type: MapType;
	data: string; // Need to extend to valid GeoJSON.
	attribute: string;
}
