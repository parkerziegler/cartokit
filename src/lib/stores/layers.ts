import { writable } from 'svelte/store';
import * as d3 from 'd3';

import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

const nifc2023Fires: CartoKitLayer = {
	id: 'nifc-2023-fires',
	displayName: 'NIFC 2023 Fires',
	type: 'Choropleth',
	data: {
		url: 'https://services3.arcgis.com/T4QMspbfLg3qTGWY/ArcGIS/rest/services/WFIGS_Interagency_Perimeters/FeatureServer/0/query?outFields=*&where=attr_CreatedOnDateTime_dt%20BETWEEN%20timestamp%20%272022-01-01%2008%3A00%3A00%27%20AND%20timestamp%20%272023-01-03%2007%3A59%3A58%27&f=geojson',
		geoJSON: {
			type: 'FeatureCollection',
			features: []
		}
	},
	attribute: 'attr_IncidentSize',
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
	'nifc-2023-fires': nifc2023Fires
});
