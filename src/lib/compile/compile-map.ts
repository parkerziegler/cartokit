import type { Map } from 'mapbox-gl';

import type { CartoKitLayer } from '$lib/types/CartoKitLayer';
import { compileSource } from '$lib/compile/compile-source';
import { compileLayer } from '$lib/compile/compile-layer';

export const compileMap = (map: Map, layers: CartoKitLayer[]) => {
	const layerSources = layers.reduce((p, layer) => {
		return p.concat('\n\n' + compileSource(layer));
	}, '');

	const layerRenders = layers.reduce((p, layer) => {
		return p.concat('\n\n' + compileLayer(map, layer));
	}, '');

	const program = `
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-81, 26.5],
    zoom: 7
  });

  map.on('load', () => {
    ${layerSources}

    ${layerRenders}
  });
  `;

	return program;
};
