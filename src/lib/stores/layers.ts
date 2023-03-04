import { writable } from 'svelte/store';
import * as d3 from 'd3';

import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

const caCounties: CartoKitLayer = {
	id: 'ca-counties',
	displayName: 'CA Counties',
	type: 'Choropleth',
	data: {
		url: 'https://api.dokku.censusreporter.org/1.0/geo/show/tiger2021?geo_ids=050|04000US06',
		geoJSON: {
			type: 'FeatureCollection',
			features: []
		}
	},
	attribute: '2013_population_estimate',
	style: {
		breaks: {
			scale: 'Quantile',
			colors: d3.schemeOranges[5].slice()
		},
		opacity: 1
	}
};

export type CartoKitIR = Record<string, CartoKitLayer>;
export const layers = writable<CartoKitIR>({
	'ca-counties': caCounties
});
