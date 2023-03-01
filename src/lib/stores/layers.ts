import { writable } from 'svelte/store';
import * as d3 from 'd3';

import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

const exampleLayer: CartoKitLayer = {
	id: 'nifc-fires',
	displayName: 'NIFC Fires',
	type: 'Choropleth',
	data: 'https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/Fire_History_Perimeters_Public/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson',
	geometry: 'Polygon',
	attribute: 'irwin_DailyAcres',
	style: {
		breaks: {
			scale: 'Quantize',
			colors: d3.schemeOranges[5].slice()
		},
		opacity: 1
	}
};

const caCounties: CartoKitLayer = {
	id: 'ca-counties',
	displayName: 'CA Counties',
	type: 'Fill',
	data: 'https://api.dokku.censusreporter.org/1.0/geo/show/tiger2021?geo_ids=04000US06,050|04000US06',
	geometry: 'Polygon',
	style: {
		fill: '#fd8d3c',
		opacity: 0.75
	}
};

export const layers = writable<CartoKitLayer[]>([exampleLayer]);
