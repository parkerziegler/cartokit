import { camelCase } from 'lodash-es';

import type { CartoKitLayer } from '$lib/types';

/**
 * Generate a MapLibre GL JS program fragment, in TypeScript, for the data source
 * for a @see{CartoKitLayer}.
 *
 * @param layer – A @see{CartoKitLayer}.
 * @param uploadTable – The symbol table tracking file uploads.
 * @returns – A MapLibre GL JS program fragment, in TypeScript.
 */
export function codegenSource(
  layer: CartoKitLayer,
  uploadTable: Map<string, string>
): string {
  const transformations = layer.data.transformations;
  const dataIdent = uploadTable.get(layer.id) ?? camelCase(layer.displayName);
  const fetchData =
    layer.data.url && !uploadTable.has(layer.id)
      ? `const ${dataIdent} = await fetchGeoJSON('${layer.data.url}');\n`
      : '';

  switch (transformations.length) {
    case 0:
      return `
  map.addSource('${layer.id}', {
		type: 'geojson',
		data: ${layer.data.url ? `"${layer.data.url}"` : dataIdent}
	});
  `;
    case 1: {
      const args = transformations[0].args
        .map((arg, i) => {
          const type = transformations[0].paramTypes[i + 1];

          return type === 'string' ? `'${arg}'` : arg;
        })
        .join(', ');

      return `
  ${fetchData}

  map.addSource('${layer.id}', {
		type: 'geojson',
		data: ${transformations[0].name}(${dataIdent}, ${args})
	});
  `;
    }
    default:
      return `
  ${fetchData}
  
  map.addSource('${layer.id}', {
		type: 'geojson',
		data: ${transformations.reduce((acc, transformation, i) => {
      const args = transformation.args
        .map((arg, i) => {
          const type = transformation.paramTypes[i + 1];

          return type === 'string' ? `'${arg}'` : arg;
        })
        .join(', ');

      return `${transformation.name}(${i === 0 ? dataIdent : acc}, ${args})`;
    }, '')}
	});
  `;
  }
}
