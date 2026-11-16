import type { CartoKitBackendAnalysis } from '#lib/types/codegen.ts';

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
    addProtocol: analysis.isPMTilesRequired
  })
    .filter(([, include]) => include)
    .map(([namedImport]) => namedImport)
    .join(', ');

  return `import { ${namedImports} } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';`;
}

/**
 * Generate a program fragment for all library and stylesheet imports.
 *
 * @param analysis The {@link CartoKitBackendAnalysis} for the current
 * {@link CartoKitIR}.
 * @returns A program fragment containing all module and stylesheet imports for
 * the program.
 */
export function codegenImports(analysis: CartoKitBackendAnalysis): string {
  const libraryImports = [
    analysis.isDuckDBFileRegistrationRequired
      ? "import { DuckDBDataProtocol } from '@duckdb/duckdb-wasm';"
      : '',
    analysis.library === 'mapbox'
      ? "import * as mapboxgl from 'mapbox-gl/esm';"
      : '',
    analysis.library === 'maplibre'
      ? codegenMapLibreNamedImports(analysis)
      : '',
    analysis.isPMTilesRequired ? "import * as pmtiles from 'pmtiles';" : '',
    analysis.isDuckDBRequired
      ? "import { initDB, toFeatureCollection } from './db';"
      : ''
  ]
    .filter(Boolean)
    .join('\n');

  const cssImports = `import '${analysis.library}-gl/dist/${analysis.library}-gl.css';
import './style.css'`;

  return [libraryImports, cssImports].join('\n\n');
}
