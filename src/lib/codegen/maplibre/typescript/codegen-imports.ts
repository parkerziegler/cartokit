import { camelCase } from 'lodash-es';

import { codegenFns } from '$lib/codegen/mapbox/typescript/codegen-fns';
import { codegenMap } from '$lib/codegen/mapbox/typescript/codegen-map';
import type { CartoKitBackendAnalysis, CartoKitIR } from '$lib/types';

/**
 * Generate a TypeScript program fragment for all library and data source
 * imports.
 *
 * @param ir – The CartoKit IR.
 * @param analysis – The analysis of the CartoKit IR.
 * @returns – A TypeScript program fragment.
 */
export function codegenImports(
  ir: CartoKitIR,
  analysis: CartoKitBackendAnalysis
): string {
  // Create a symbol table mapping layer ids to identifiers referencing imported
  // source data.
  const uploadTable = new Map<string, string>();

  const libraryImports = [
    "import mapboxgl from 'maplibre-gl';",
    analysis.isTurfRequired ? "import * as turf from '@turf/turf';" : '',
    analysis.isLodashFlowRequired ? "import { flow } from 'lodash-es';" : '',
    analysis.isGeoJSONNamespaceRequired
      ? "import type * as GeoJSON from 'geojson';"
      : ''
  ]
    .filter(Boolean)
    .join('\n');

  const fileImports = Object.values(ir.layers).reduce((acc, layer) => {
    if (layer.data.fileName) {
      const dataIdent = camelCase(layer.displayName);
      uploadTable.set(layer.id, dataIdent);

      return acc.concat(`import ${dataIdent} from './${layer.data.fileName}';`);
    }

    return acc;
  }, '');

  const imports = `${libraryImports}
  
  ${fileImports}`;

  return `${imports}

  ${codegenFns(ir, analysis)}

  ${codegenMap(ir, uploadTable, analysis)}`;
}
