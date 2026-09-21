import { camelCase } from 'lodash-es';

import { codegenDataFileName } from '$lib/codegen/codegen-data';
import { codegenFns } from '$lib/codegen/codegen-fns';
import { codegenMap } from '$lib/codegen/codegen-map';
import type { CartoKitIR } from '$lib/types';
import type { CartoKitBackendAnalysis } from '$lib/types/codegen';

/**
 * Generate named imports for required classes and functions from maplibre-gl.
 *
 * @param analysis The {@link CartoKitBackendAnalysis} for the current
 * {@link CartoKitIR}.
 * @returns A program fragment containing all maplibre-gl imports.
 */
function codegenMapLibreNamedImports(analysis: CartoKitBackendAnalysis) {
  const namedImports = Object.entries({
    Map: true,
    setWorkerUrl: true,
    addProtocol: analysis.isPMTilesRequired && analysis.library === 'maplibre'
  })
    .filter(([, include]) => include)
    .map(([namedImport]) => namedImport)
    .join(', ');

  return `import { ${namedImports} } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';`;
}

/**
 * Generate a program fragment for all library and data source imports.
 *
 * @param ir The {@link CartoKitIR}.
 * @param analysis The {@link CartoKitBackendAnalysis} for the current
 * {@link CartoKitIR}.
 * @returns A program fragment containing all modules and file imports for the
 * program.
 */
export function codegenImports(
  ir: CartoKitIR,
  analysis: CartoKitBackendAnalysis
): string {
  // Create a symbol table mapping layer ids to identifiers referencing imported
  // source data.
  const uploadTable = new Map<string, string>();

  const libraryImports = [
    analysis.library === 'mapbox'
      ? `import * as mapboxgl from 'mapbox-gl/esm';`
      : '',
    analysis.library === 'maplibre'
      ? codegenMapLibreNamedImports(analysis)
      : '',
    analysis.isTurfRequired ? "import * as turf from '@turf/turf';" : '',
    analysis.language === 'typescript' && analysis.isGeoJSONNamespaceRequired
      ? "import type * as GeoJSON from 'geojson';"
      : '',
    analysis.isPMTilesRequired && analysis.library === 'maplibre'
      ? "import * as pmtiles from 'pmtiles';"
      : ''
  ]
    .filter(Boolean)
    .join('\n');

  const fileImports = Object.values(ir.layers)
    .flatMap((layer) => {
      if (
        layer.source.type !== 'geojson' ||
        layer.source.location.type !== 'file'
      ) {
        return [];
      }

      const dataIdent = camelCase(layer.displayName);
      uploadTable.set(layer.id, dataIdent);

      return `import ${dataIdent} from './data/${codegenDataFileName(layer.source.location.fileName)}';`;
    })
    .join('\n');

  const cssImports = `import '${analysis.library}-gl/dist/${analysis.library}-gl.css';
import './style.css'`;

  return [
    libraryImports,
    cssImports,
    fileImports,
    analysis.library === 'maplibre' ? `setWorkerUrl(workerUrl)` : '',
    codegenFns(ir, analysis),
    codegenMap(ir, uploadTable, analysis)
  ]
    .filter(Boolean)
    .join('\n\n');
}
