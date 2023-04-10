import type { Map } from 'maplibre-gl';

import { codegenSource } from '$lib/codegen/codegen-source';
import { codegenLayer } from '$lib/codegen/codegen-layer';
import type { CartoKitIR } from '$lib/stores/layers';

/**
 * Generate a Mapbox GL JS program fragment for layer sources, layer renders,
 * the top-level map instance.
 *
 * @param map – The MapLibre GL JS map instance.
 * @param layers – The CartoKit IR.
 *
 * @returns – A Mapbox GL JS program fragment.
 */
export function codegenMap(map: Map, layers: CartoKitIR): string {
  const layerSources = Object.values(layers).reduce((p, layer) => {
    return p.concat('\n\n' + codegenSource(layer));
  }, '');

  const layerRenders = Object.values(layers).reduce((p, layer) => {
    return p.concat('\n\n' + codegenLayer(layer));
  }, '');

  const { lng, lat } = map.getCenter();

  const program = `
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [${lng}, ${lat}],
    zoom: ${map.getZoom()}
  });

  map.on('load', () => {
    ${layerSources}

    ${layerRenders}
  });
  `;

  return program;
}
