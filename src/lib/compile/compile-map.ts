import type { Map } from 'mapbox-gl';

import { compileSource } from '$lib/compile/compile-source';
import { compileLayer } from '$lib/compile/compile-layer';
import type { CartoKitIR } from '$lib/stores/layers';

/**
 * Compile the map instance and layers into a Mapbox GL JS program.
 *
 * @param map – the Mapbox GL JS map instance.
 * @param layers – the CartoKit IR.
 *
 * @returns – a Mapbox GL JS program fragment.
 */
export const compileMap = (map: Map, layers: CartoKitIR): string => {
	const layerSources = Object.values(layers).reduce((p, layer) => {
		return p.concat('\n\n' + compileSource(layer));
	}, '');

	const layerRenders = Object.values(layers).reduce((p, layer) => {
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
