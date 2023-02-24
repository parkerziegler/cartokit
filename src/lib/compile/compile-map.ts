import type { Map } from 'mapbox-gl';

import { compileSource } from '$lib/compile/compile-source';
import { compileLayer } from '$lib/compile/compile-layer';
import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

/**
 * Compile the map instance and layers into a Mapbox GL JS program.
 *
 * @param map – the Mapbox GL JS map instance.
 * @param layers – the CartoKit IR.
 *
 * @returns – a Mapbox GL JS program fragment.
 */
export const compileMap = (map: Map, layers: CartoKitLayer[]): string => {
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
