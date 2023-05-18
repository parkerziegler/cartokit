import type { Map as MapLibreMap } from 'maplibre-gl';

import { PUBLIC_MAPTILER_API_KEY } from '$env/static/public';
import { isFetchGeoJSONRequired } from '$lib/codegen/codegen-fns';
import { codegenLayer } from '$lib/codegen/codegen-layer';
import { codegenSource } from '$lib/codegen/codegen-source';
import type { CartoKitIR } from '$lib/stores/ir';

interface CodegenMapParams {
  map: MapLibreMap;
  ir: CartoKitIR;
  uploadTable: Map<string, string>;
  transformTable: Map<string, boolean>;
}

/**
 * Generate a Mapbox GL JS program fragment for layer sources, layer renders,
 * and the top-level map instance.
 *
 * @params params – Required parameters to generate the Mapbox GL JS program
 * fragment.
 * @param map – The MapLibre GL JS map instance.
 * @param ir – The CartoKit IR.
 * @param uploadTable – The symbol table tracking file uploads.
 * @param transformTable – The transformation symbol table.
 *
 * @returns – A Mapbox GL JS program fragment.
 */
export function codegenMap({
  map,
  ir,
  uploadTable,
  transformTable
}: CodegenMapParams): string {
  const layerSources = Object.values(ir.layers).reduce((p, layer) => {
    return p.concat('\n\n' + codegenSource(layer, uploadTable));
  }, '');

  const layerRenders = Object.values(ir.layers).reduce((p, layer) => {
    return p.concat('\n\n' + codegenLayer(layer));
  }, '');

  const { lng, lat } = map.getCenter();
  const isLoadAsync = isFetchGeoJSONRequired(ir, transformTable);

  const program = `
  const map = new mapboxgl.Map({
    container: 'map',
    style: '${ir.basemap.url.replace(
      PUBLIC_MAPTILER_API_KEY,
      '<YOUR_MAPTILER_API_KEY>'
    )}',
    center: [${lng}, ${lat}],
    zoom: ${map.getZoom()}
  });

  map.on('load', ${isLoadAsync ? 'async' : ''}() => {
    ${layerSources}

    ${layerRenders}
  });
  `;

  return program;
}
