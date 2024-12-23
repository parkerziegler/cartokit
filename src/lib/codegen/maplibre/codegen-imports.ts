import { camelCase } from 'lodash-es';

import { codegenFns } from '$lib/codegen/maplibre/codegen-fns';
import { codegenMap } from '$lib/codegen/maplibre/codegen-map';
import type { CartoKitIR } from '$lib/types';

/**
 * Generate a JavaScript program fragment for all library and data source im-
 * ports.
 *
 * @param ir – The CartoKit IR.
 * @returns – A JavaScript program fragment.
 */
export function codegenImports(ir: CartoKitIR) {
  // Create a symbol table mapping layer ids to identifiers referencing imported
  // source data.
  const uploadTable = new Map<string, string>();

  const fileImports = Object.values(ir.layers).reduce((acc, layer) => {
    if (layer.data.fileName) {
      const dataIdent = camelCase(layer.displayName);
      uploadTable.set(layer.id, dataIdent);

      return acc.concat(`import ${dataIdent} from './${layer.data.fileName}';`);
    }

    return acc;
  }, '');

  const imports = `import maplibregl from 'maplibre-gl';
  ${isTurfRequired(ir) ? "import * as turf from '@turf/turf';\n" : ''}
  ${isLodashFlowRequired(ir) ? "import { flow } from 'lodash-es';\n" : ''}
  ${fileImports}`;

  return `${imports}

  ${codegenFns(ir)}

  ${codegenMap(ir, uploadTable)}`;
}

/**
 * Determine whether @turf/turf is required for cross-geometry transformations.
 *
 * @param ir – The CartoKit IR.
 * @returns – A Boolean value indicating whether @turf/turf is required.
 */
function isTurfRequired({ layers }: CartoKitIR): boolean {
  for (const layer of Object.values(layers)) {
    return (
      layer.data.transformations.filter(
        (transformation) => transformation.type === 'geometric'
      ).length > 0
    );
  }

  return false;
}

/**
 * Determine whether lodash/flow is required for chaining transformations.
 *
 * @param ir – The CartoKit IR.
 * @returns - A Boolean value indicating whether lodash/flow is required.
 */
function isLodashFlowRequired({ layers }: CartoKitIR): boolean {
  return Object.values(layers).some(
    (layer) => layer.data.transformations.length > 1
  );
}
