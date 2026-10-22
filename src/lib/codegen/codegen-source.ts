import { camelCase } from 'lodash-es';

import type { CartoKitLayer } from '$lib/types';
import type { CartoKitBackendAnalysis } from '$lib/types/codegen';
import { catalog } from '$lib/state/catalog.svelte';
import type { GeoParquetCatalogEntry } from '$lib/types/catalog';
import { generateSelectList } from '$lib/utils/db';

/**
 * Generate a program fragment for a {@link CartoKitSource}.
 *
 * @param layer A {@link CartoKitLayer}.
 * @param analysis The {@link CartoKitBackendAnalysis} for the current
 * {@link CartoKitIR}.
 * @returns A program fragment containing the definition of the data source
 * for the {@link CartoKitLayer}.
 */
export function codegenSource(
  layer: CartoKitLayer,
  analysis: CartoKitBackendAnalysis
): string {
  const dataIdent = camelCase(layer.displayName);

  switch (layer.source.type) {
    case 'geojson': {
      const transformations = layer.source.transformations;
      const url =
        layer.source.location.type === 'api'
          ? layer.source.location.url
          : undefined;
      const fetchData = url
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
    case 'geoparquet': {
      const entry = catalog.value[layer.id] as GeoParquetCatalogEntry;

      // Uploaded files are served from public/data, so both locations are read
      // over HTTP.
      const url =
        layer.source.location.type === 'api'
          ? layer.source.location.url
          : layer.source.location.file.name;

      // Query the file directly rather than creating a table, using the columns
      // and geometry column cataloged when the layer was added. Replace `, \,
      // and $ characters with their escaped equivalents to ensure these
      // characters do not interfere with the template literal below.
      const selectList = generateSelectList(
        entry.columns,
        entry.geometryColumn
      ).replace(/[`\\$]/g, '\\$&');

      // If loading a local GeoParquet file from public/data, add a call to
      // register it.
      let register = '';
      if (layer.source.location.type === 'file') {
        register = `await db.registerFileURL("${url}", "/data/${url}", DuckDBDataProtocol.HTTP, false);`;
      }

      const addSource = `const ${dataIdent} = await conn.query(
          \`SELECT ${selectList} FROM read_parquet('${url}');\`
        );

        map.addSource("${layer.id}", {
          type: "geojson",
          data: toFeatureCollection(${dataIdent})
        });
      `;

      return [register, addSource].filter(Boolean).join('\n');
    }
    case 'pmtiles': {
      const url =
        analysis.library === 'maplibre'
          ? `pmtiles://${layer.source.location.url}`
          : layer.source.location.url;

      return `
        map.addSource("${layer.id}", {
          type: "vector",
          url: ${JSON.stringify(url)}
        });
    `;
    }
  }
}
