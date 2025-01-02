import { codegenLayer } from '$lib/codegen/maplibre/javascript/codegen-layer';
import { codegenMapStyle } from '$lib/codegen/maplibre/javascript/codegen-map-style';
import { codegenSource } from '$lib/codegen/maplibre/javascript/codegen-source';
import type { CartoKitIR, CartoKitBackendAnalysis } from '$lib/types';

/**
 * Generate a MapLibre GL JS program fragment for layer sources, layer renders,
 * and the top-level map instance.
 *
 * @param ir – The CartoKit IR.
 * @param uploadTable – The symbol table tracking file uploads.
 * @param analysis – The analysis of the CartoKit IR.
 * @returns – A MapLibre GL JS program fragment.
 */
export function codegenMap(
  ir: CartoKitIR,
  uploadTable: Map<string, string>,
  analysis: CartoKitBackendAnalysis
): string {
  const layerSources = Object.values(ir.layers).reduce((p, layer) => {
    return p.concat('\n\n' + codegenSource(layer, uploadTable));
  }, '');
  const layerRenders = Object.values(ir.layers).reduce((p, layer) => {
    return p.concat('\n\n' + codegenLayer(layer));
  }, '');

  const isLoadAsync = analysis.isFetchGeoJSONRequired;

  const program = `
  const map = new maplibregl.Map({
    container: 'map',
    style: ${codegenMapStyle(ir)},
    center: [${ir.center.join(', ')}],
    zoom: ${ir.zoom}
  });

  map.on('load', ${isLoadAsync ? 'async ' : ''}() => {
    ${layerSources}

    ${layerRenders}
  });
  `;

  return program;
}
