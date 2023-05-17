import type { Map as MapLibreMap } from 'maplibre-gl';
import camelCase from 'lodash.camelcase';

import { codegenFns } from '$lib/codegen/codegen-fns';
import { codegenMap } from '$lib/codegen/codegen-map';
import type { CartoKitIR } from '$lib/stores/ir';
import type { CartoKitLayer } from '$lib/types/CartoKitLayer';
import { getFeatureCollectionType } from '$lib/utils/geojson';

/**
 * Generate a program fragment for all library and data source imports.
 *
 * @param map – The MapLibre GL JS map instance.
 * @param ir – The CartoKit IR.
 *
 * @returns – A program fragment.
 */
export function codegenImports(map: MapLibreMap, ir: CartoKitIR) {
  // Create a symbol table mapping layer ids to identifiers referencing imported
  // source data.
  const uploadTable = new Map<string, string>();

  // Create a symbol table to track which layers performed cross-geometry data
  // transformations.
  const transformTable = new Map<string, boolean>();

  const fileImports = Object.values(ir.layers).reduce((acc, layer) => {
    if (isTransformRequired(layer)) {
      transformTable.set(layer.id, true);
    }

    if (layer.data.fileName) {
      const dataIdent = camelCase(layer.displayName);
      uploadTable.set(layer.id, dataIdent);

      return acc.concat(`import ${dataIdent} from './${layer.data.fileName}';`);
    }

    return acc;
  }, '');

  const imports = `import mapboxgl from 'mapbox-gl';
  ${transformTable.size > 0 ? "import * as turf from '@turf/turf';\n" : ''}
  ${fileImports}
  
  mapboxgl.accessToken = '<YOUR_MAPBOX_ACCESS_TOKEN>'`;

  return `${imports}

  ${codegenFns(ir.layers, transformTable)}
  
  ${codegenMap({ map, ir, uploadTable, transformTable })}`;
}

/**
 * Determine whether some form of cross-geometry transformation was performed on
 * the original source data of a layer.
 *
 * @param layer – A CartoKit layer.
 *
 * @returns – A Boolean value indicating whether a cross-geometry transformation
 * was performed on the input layer.
 */
function isTransformRequired(layer: CartoKitLayer): boolean {
  const geometry = getFeatureCollectionType(layer.data.geoJSON);
  const rawGeometry = getFeatureCollectionType(layer.data.rawGeoJSON);

  return geometry !== rawGeometry;
}
