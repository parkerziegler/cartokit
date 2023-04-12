import type { Map as MapLibreMap } from 'maplibre-gl';

import { isFetchGeoJSONRequired } from '$lib/codegen/codegen-fns';
import { codegenLayer } from '$lib/codegen/codegen-layer';
import { codegenSource } from '$lib/codegen/codegen-source';
import type { CartoKitIR } from '$lib/stores/layers';

interface CodegenMapParams {
  map: MapLibreMap;
  layers: CartoKitIR;
  dataTable: Map<string, string>;
  transformTable: Map<string, boolean>;
}

/**
 * Generate a Mapbox GL JS program fragment for layer sources, layer renders,
 * the top-level map instance.
 *
 * @params params – Required parameters to generate the Mapbox GL JS program
 * fragment.
 * @param map – The MapLibre GL JS map instance.
 * @param layers – The CartoKit IR.
 * @param dataTable – The source data symbol table.
 * @param transformTable – The transformation symbol table.
 *
 * @returns – A Mapbox GL JS program fragment.
 */
export function codegenMap({
  map,
  layers,
  dataTable,
  transformTable
}: CodegenMapParams): string {
  const layerSources = Object.values(layers).reduce((p, layer) => {
    return p.concat('\n\n' + codegenSource(layer, dataTable));
  }, '');

  const layerRenders = Object.values(layers).reduce((p, layer) => {
    return p.concat('\n\n' + codegenLayer(layer));
  }, '');

  const { lng, lat } = map.getCenter();
  const isAsync = isFetchGeoJSONRequired(layers, transformTable);

  const program = `
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [${lng}, ${lat}],
    zoom: ${map.getZoom()}
  });

  map.on('load', ${isAsync ? 'async' : ''}() => {
    ${layerSources}

    ${layerRenders}
  });
  `;

  return program;
}
