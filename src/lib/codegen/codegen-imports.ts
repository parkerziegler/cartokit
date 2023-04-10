import type { Map } from 'maplibre-gl';
import camelCase from 'lodash.camelcase';

import { codegenMap } from '$lib/codegen/codegen-map';
import type { CartoKitIR } from '$lib/stores/layers';

/**
 * Generate a program fragment for all library and data source imports.
 *
 * @param map – The MapLibre GL JS map instance.
 * @param layers – The CartoKit IR.
 * @returns – A program fragment.
 */
export function codegenImports(map: Map, layers: CartoKitIR) {
  const fileImports = Object.values(layers).reduce((acc, layer) => {
    if (layer.data.fileName) {
      return acc.concat(
        `import ${camelCase(layer.data.fileName)} from './${
          layer.data.fileName
        }';`
      );
    }

    return acc;
  }, '');

  const imports = `import mapboxgl from 'mapbox-gl';
  ${fileImports}
  
  mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN;'`;

  return `${imports}
  
  ${codegenMap(map, layers)}`;
}
