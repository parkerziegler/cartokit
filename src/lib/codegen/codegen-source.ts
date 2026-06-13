import { camelCase } from 'lodash-es';

import type { CartoKitBackendAnalysis, CartoKitLayer } from '$lib/types';

/**
 * Generate a program fragment for a {@link CartoKitSource}.
 *
 * @param layer A {@link CartoKitLayer}.
 * @param uploadTable The symbol table tracking file uploads.
 * @param analysis The {@link CartoKitBackendAnalysis} for the current
 * {@link CartoKitIR}.
 * @returns A program fragment containing the definition of the data source
 * for the {@link CartoKitLayer}.
 */
export function codegenSource(
  layer: CartoKitLayer,
  uploadTable: Map<string, string>,
  analysis: CartoKitBackendAnalysis
): string {
  switch (layer.source.type) {
    case 'geojson': {
      const transformations = layer.source.transformations;
      const url =
        layer.source.location.type === 'api'
          ? layer.source.location.url
          : undefined;
      const dataIdent =
        uploadTable.get(layer.id) ?? camelCase(layer.displayName);
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
    case 'vector': {
      const protocolPrefix =
        analysis.library === 'maplibre' ? 'pmtiles://' : '';

      return `
        map.addSource('${layer.id}', {
          type: 'vector',
          url: ${JSON.stringify(protocolPrefix + layer.source.location.url)}
        });
    `;
    }
  }
}
