import type { Map as MapLibreMap } from 'maplibre-gl';
import camelCase from 'lodash.camelcase';

import { codegenMap } from '$lib/codegen/codegen-map';
import type { CartoKitIR } from '$lib/stores/layers';
import { getFeatureCollectionType } from '$lib/utils/geojson';

/**
 * Generate a program fragment for all library and data source imports.
 *
 * @param map – The MapLibre GL JS map instance.
 * @param layers – The CartoKit IR.
 *
 * @returns – A program fragment.
 */
export function codegenImports(map: MapLibreMap, layers: CartoKitIR) {
  // Create a symbol table mapping layer ids to identifiers referencing imported source data.
  const dataTable = new Map<string, string>();

  const fileImports = Object.values(layers).reduce((acc, layer) => {
    if (layer.data.fileName) {
      const dataIdent = camelCase(layer.data.fileName);

      dataTable.set(layer.id, dataIdent);

      return acc.concat(`import ${dataIdent} from './${layer.data.fileName}';`);
    }

    return acc;
  }, '');

  const imports = `import mapboxgl from 'mapbox-gl';
  ${isTurfRequired(layers) ? "import * as turf from '@turf/turf';\n" : ''}
  ${fileImports}
  
  mapboxgl.accessToken = '<YOUR_MAPBOX_ACCESS_TOKEN>'`;

  return `${imports}
  
  ${codegenMap(map, layers, dataTable)}`;
}

/**
 * A helper function to determine whether the turf.js is a required dependency of the generated program.
 *
 * @param layers – The CartoKit IR.
 *
 * @returns – A Boolean flag indicating if turf.js is required.
 */
function isTurfRequired(layers: CartoKitIR): boolean {
  for (const layer of Object.values(layers)) {
    const geometry = getFeatureCollectionType(layer.data.geoJSON);
    const rawGeometry = getFeatureCollectionType(layer.data.rawGeoJSON);

    // If the original geometry of the layer differs from the current geometry,
    // we must produce code using Turf to perform the transformation.
    if (geometry !== rawGeometry) {
      return true;
    }
  }

  return false;
}
