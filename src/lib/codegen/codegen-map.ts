import type { Map as MapLibreMap } from 'maplibre-gl';

import { PUBLIC_MAPTILER_API_KEY } from '$env/static/public';
import { isFetchGeoJSONRequired } from '$lib/codegen/codegen-fns';
import { codegenLayer } from '$lib/codegen/codegen-layer';
import { codegenSource } from '$lib/codegen/codegen-source';
import type { CartoKitIR } from '$lib/stores/ir';

/**
 * Generate a Mapbox GL JS program fragment for layer sources, layer renders,
 * and the top-level map instance.
 *
 * @param map – The MapLibre GL JS map instance.
 * @param ir – The CartoKit IR.
 * @param uploadTable – The symbol table tracking file uploads.
 *
 * @returns – A Mapbox GL JS program fragment.
 */
export function codegenMap(
  map: MapLibreMap,
  ir: CartoKitIR,
  uploadTable: Map<string, string>
): string {
  const layerSources = Object.values(ir.layers).reduce((p, layer) => {
    return p.concat('\n\n' + codegenSource(layer, uploadTable));
  }, '');

  const layerRenders = Object.values(ir.layers).reduce((p, layer) => {
    return p.concat('\n\n' + codegenLayer(layer));
  }, '');

  const { lng, lat } = map.getCenter();
  const isLoadAsync = isFetchGeoJSONRequired(ir);

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

  map.on('load', ${isLoadAsync ? 'async ' : ''}() => {
    ${layerSources}

    ${layerRenders}
  });
  `;

  return program;
}
