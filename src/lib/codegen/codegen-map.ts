import { orderBy } from 'lodash-es';

import { codegenLayer } from '#lib/codegen/codegen-layer.ts';
import { codegenProjection } from '#lib/codegen/codegen-projection.ts';
import {
  codegenDuckDBFileRegistrations,
  codegenSource
} from '#lib/codegen/codegen-source.ts';
import { prop, props, withDefault } from '#lib/codegen/utils.ts';
import type { CartoKitIR } from '#lib/types/index.ts';
import type { CartoKitBackendAnalysis } from '#lib/types/codegen.ts';

/**
 * Generate a program fragment for map setup, the top-level map instance, layer
 * sources, and layer renders.
 *
 * @param ir The {@link CartoKitIR}.
 * @param analysis The {@link CartoKitBackendAnalysis} for the current
 * {@link CartoKitIR}.
 * @returns A program fragment containing the definition of the map instance,
 * with accompanying calls to add data sources and layers to the map.
 */
export function codegenMap(
  ir: CartoKitIR,
  analysis: CartoKitBackendAnalysis
): string {
  const projection = codegenProjection(ir, analysis.library);
  const layers = orderBy(Object.values(ir.layers), 'layout.z', 'asc');

  const workerUrl =
    analysis.library === 'maplibre' ? 'setWorkerUrl(workerUrl)' : '';

  const protocol = analysis.isPMTilesRequired
    ? `const protocol = new pmtiles.Protocol();
addProtocol('pmtiles', protocol.tile);`
    : '';

  const mapOptions = props(
    analysis.library === 'mapbox'
      ? prop('accessToken', 'YOUR_MAPBOX_ACCESS_TOKEN')
      : '',
    prop('container', 'map'),
    prop('style', ir.basemap.url.replace(/=.+$/, '=_MAPTILER_API_KEY')),
    prop('center', ir.center),
    prop('zoom', ir.zoom),
    withDefault('bearing', ir.bearing),
    withDefault('pitch', ir.pitch),
    analysis.library === 'mapbox' ? projection : ''
  );

  const map = `const map = new ${analysis.library === 'mapbox' ? 'mapboxgl.' : ''}Map({
  ${mapOptions}
});`;

  const mapLoadBody = [
    analysis.isDuckDBRequired
      ? `const { conn${analysis.isDuckDBFileRegistrationRequired ? ', db' : ''} } = await initDB();`
      : '',
    codegenDuckDBFileRegistrations(ir),
    ...layers.map((layer) => codegenSource(layer, ir, analysis)),
    ...layers
      .filter((layer) => !layer.layout.deleted)
      .map((layer) => codegenLayer(layer, ir.basemap.beforeId))
  ]
    .filter(Boolean)
    .join('\n\n');

  const mapLoad = mapLoadBody
    ? `map.on('load', ${analysis.isDuckDBRequired ? 'async ' : ''}() => {
  ${mapLoadBody}
});`
    : '';

  const mapStyleLoad =
    analysis.library === 'maplibre' && projection
      ? `map.on('style.load', () => {
  ${projection}
});`
      : '';

  return [workerUrl, protocol, map, mapLoad, mapStyleLoad]
    .filter(Boolean)
    .join('\n\n');
}
