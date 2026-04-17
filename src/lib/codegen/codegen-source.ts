import { camelCase } from 'lodash-es';

import type { CartoKitLayer } from '$lib/types';

/**
 * Generate a program fragment for the data source for a {@link CartoKitLayer},
 * dispatching on the source's type to the appropriate source-specific
 * generator.
 *
 * @param layer A {@link CartoKitLayer}.
 * @param uploadTable The symbol table tracking file uploads.
 * @returns A program fragment containing the definition of the data source
 * for the {@link CartoKitLayer}.
 */
export function codegenSource(
  layer: CartoKitLayer,
  uploadTable: Map<string, string>
): string {
  switch (layer.source.type) {
    case 'geojson':
      return codegenGeoJSONSource(layer, uploadTable);
    case 'vector':
      return codegenVectorTileSource(layer);
  }
}

/**
 * Generate a program fragment for a GeoJSON data source for a
 * {@link CartoKitLayer}.
 *
 * @param layer A {@link CartoKitLayer} backed by a GeoJSON source.
 * @param uploadTable The symbol table tracking file uploads.
 * @returns A program fragment containing the definition of the GeoJSON data
 * source for the {@link CartoKitLayer}.
 */
function codegenGeoJSONSource(
  layer: CartoKitLayer,
  uploadTable: Map<string, string>
): string {
  if (layer.source.type !== 'geojson') {
    return '';
  }

  const transformations = layer.source.transformations;
  const url =
    layer.source.location.type === 'api'
      ? layer.source.location.url
      : undefined;
  const dataIdent = uploadTable.get(layer.id) ?? camelCase(layer.displayName);
  const fetchData =
    url && !uploadTable.has(layer.id)
      ? `const ${dataIdent} = await fetchGeoJSON(${JSON.stringify(url)});\n`
      : '';

  switch (transformations.length) {
    case 0:
      return `
  map.addSource('${layer.id}', {
		type: 'geojson',
		data: ${url ? `"${url}"` : dataIdent}
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

/**
 * Generate a program fragment for a vector tile data source for a
 * {@link CartoKitLayer}, using MapLibre GL JS's vector tile source
 * specification.
 *
 * @param layer A {@link CartoKitLayer} backed by a vector tile source.
 * @returns A program fragment containing the definition of the vector tile
 * data source for the {@link CartoKitLayer}.
 */
function codegenVectorTileSource(layer: CartoKitLayer): string {
  if (layer.source.type !== 'vector') {
    return '';
  }

  return `
  map.addSource('${layer.id}', {
		type: 'vector',
		url: ${JSON.stringify(layer.source.location.url)}
	});
  `;
}
