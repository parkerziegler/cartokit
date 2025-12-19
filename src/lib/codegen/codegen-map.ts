import { orderBy } from 'lodash-es';

import { codegenLayer } from '$lib/codegen/codegen-layer';
import { codegenMapStyle } from '$lib/codegen/codegen-map-style';
import { codegenProjection } from '$lib/codegen/codegen-projection';
import { codegenSource } from '$lib/codegen/codegen-source';
import type { CartoKitBackendAnalysis, CartoKitIR } from '$lib/types';

/**
 * Generate a program fragment for layer sources, layer renders, and the
 * top-level map instance.
 *
 * @param ir The CartoKit IR.
 * @param uploadTable The symbol table tracking file uploads.
 * @param analysis The analysis of the CartoKit IR.
 * @returns A program fragment.
 */
export function codegenMap(
  ir: CartoKitIR,
  uploadTable: Map<string, string>,
  analysis: CartoKitBackendAnalysis
): string {
  const projection = codegenProjection(ir, analysis.library);
  const layerSources = orderBy(
    Object.values(ir.layers),
    'layout.z',
    'asc'
  ).reduce((p, layer) => {
    return p.concat('\n\n' + codegenSource(layer, uploadTable));
  }, '');
  const layerRenders = orderBy(
    Object.values(ir.layers),
    'layout.z',
    'asc'
  ).reduce((p, layer) => {
    return p.concat('\n\n' + codegenLayer(layer));
  }, '');

  const isLoadAsync = analysis.isFetchGeoJSONRequired;

  const program = `
  const map = new ${analysis.library}gl.Map({
    container: 'map',
    style: ${codegenMapStyle(ir)},
    center: [${ir.center.join(', ')}],
    zoom: ${ir.zoom},
    ${analysis.library === 'mapbox' ? projection : ''}
  });

  ${analysis.library === 'maplibre' ? projection : ''}

  map.on('load', ${isLoadAsync ? 'async ' : ''}() => {
    ${layerSources}

    ${layerRenders}
  });
  `;

  return program;
}
