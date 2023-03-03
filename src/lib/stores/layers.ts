import { writable } from 'svelte/store';
import * as d3 from 'd3';

import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

const nifcFires: CartoKitLayer = {
	id: 'nifc-fires',
	displayName: 'NIFC Fires',
	type: 'Choropleth',
	data: {
		url: 'https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/Fire_History_Perimeters_Public/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson',
		geoJSON: {
			type: 'FeatureCollection',
			features: []
		}
	},
	attribute: 'irwin_DailyAcres',
	style: {
		breaks: {
			scale: 'Quantize',
			colors: d3.schemeOranges[5].slice()
		},
		opacity: 1
	}
};

export type CartoKitIR = Record<string, CartoKitLayer>;
export const layers = writable<CartoKitIR>({
	'nifc-fires': nifcFires
});
