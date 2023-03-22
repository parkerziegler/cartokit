import { codegenSource } from '$lib/codegen/codegen-source';
import { codegenLayer } from '$lib/codegen/codegen-layer';
import type { CartoKitIR } from '$lib/stores/layers';

/**
 * Generate a Mapbox GL JS program fragment for layer sources, layer renders,
 * the top-level map instance.
 *
 * @param map – the Mapbox GL JS map instance.
 * @param layers – the CartoKit IR.
 *
 * @returns – a Mapbox GL JS program fragment.
 */
export function codegenMap(layers: CartoKitIR): string {
	const layerSources = Object.values(layers).reduce((p, layer) => {
		return p.concat('\n\n' + codegenSource(layer));
	}, '');

	const layerRenders = Object.values(layers).reduce((p, layer) => {
		return p.concat('\n\n' + codegenLayer(layer));
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
}
