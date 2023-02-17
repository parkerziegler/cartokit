import type { Map } from 'mapbox-gl';

import type { CartoKitLayer } from '$lib/types/CartoKitLayer';
import { compileSource } from '$lib/compile/compile-source';
import { compileLayer } from '$lib/compile/compile-layer';

export const compileMap = (map: Map, layers: CartoKitLayer[]) => {
	const mbLayers = map.getStyle().layers;

	const layerSources = layers.reduce((p, layer) => {
		const source = mbLayers.find((l) => l.id === layer.id);

		if (source) {
			return p.concat('\n\n' + compileSource(layer));
		}

		return p;
	}, '');

	const layerRenders = layers.reduce((p, layer) => {
		const mbLayer = mbLayers.find((l) => l.id === layer.id);

		if (mbLayer) {
			return p.concat('\n\n' + compileLayer(map, layer, mbLayer));
		}

		return p;
	}, '');

	const program = `
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-110, 35],
    zoom: 6
  });

  map.on('load', () => {
    ${layerSources}

    ${layerRenders}
  });
  `;

	return program;
};
