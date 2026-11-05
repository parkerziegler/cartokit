import { camelCase } from 'lodash-es';

import type { CartoKitIR, CartoKitLayer } from '$lib/types';
import type { CartoKitBackendAnalysis } from '$lib/types/codegen';
import type { DuckDBTable } from '$lib/types/db';
import type {
  CartoKitGeoJSONSource,
  CartoKitGeoParquetSource,
  CartoKitPMTilesSource,
  CartoKitTableSource
} from '$lib/types/source';
import {
  generateCreateTableStatement,
  generateCreateDerivedTableStatement,
  generateSelectStatement
} from '$lib/utils/db';
import { getLayerDescendants } from '$lib/utils/ir';

/**
 * Get the name a source's data is read under in generated code: its URL, or the
 * name of its uploaded file.
 *
 * @param source A {@link CartoKitGeoJSONSource} or {@link CartoKitGeoParquetSource}.
 * @returns The URL or file name.
 */
function codegenSourceName({
  location
}: CartoKitGeoJSONSource | CartoKitGeoParquetSource): string {
  return location.type === 'api' ? location.url : location.file.name;
}

/**
 * Generate a program fragment registering uploaded files with DuckDB.
 *
 * @param ir The {@link CartoKitIR}.
 * @returns A (potentially empty) program fragment.
 */
export function codegenRegistrations(ir: CartoKitIR): string {
  const promises = Object.values(ir.layers).flatMap((layer) =>
    ['geoparquet', 'geojson'].includes(layer.source.type) &&
    layer.source.location.type === 'file'
      ? `db.registerFileURL("${layer.source.location.file.name}", "/data/${layer.source.location.file.name}", DuckDBDataProtocol.HTTP, false)`
      : []
  );

  switch (promises.length) {
    case 0:
      return '';
    case 1:
      return `await ${promises};`;
    default:
      return `await Promise.all([${promises.join(', ')}]);`;
  }
}

/**
 * Generate a program fragment that creates a layer's table in DuckDB, queries
 * its features, and adds them to the map as a GeoJSON source.
 *
 * @param createStatement The SQL CREATE TABLE statement for the layer's table.
 * @param layerId The id of the layer the source belongs to.
 * @param table The {@link DuckDBTable} the statement creates.
 * @param dataIdent The identifier the layer's data is bound to in generated code.
 * @returns A program fragment adding the source to the map.
 */
function codegenDuckDBSource(
  ir: CartoKitIR,
  createStatement: string,
  layerId: string,
  table: DuckDBTable,
  dataIdent: string
) {
  const layer = ir.layers[layerId];
  const dependents = getLayerDescendants(ir, layer.id);

  // If the layer is flagged as deleted but still has dependents, ensure that we
  // generate a statement to create the table.
  if (layer.layout.deleted && dependents.size > 0) {
    return `await conn.query(\`
      ${createStatement}
    \`);`;
  }

  const selectStatement = generateSelectStatement(layerId, table);
  return [
    `const ${dataIdent} = await conn.query(\`
      ${createStatement}
      ${selectStatement}
    \`);`,
    `map.addSource("${layerId}", {
      type: "geojson",
      data: toFeatureCollection(${dataIdent})
    });`
  ].join('\n\n');
}

/**
 * Generate a program fragment for a {@link CartoKitGeoJSONSource}. If other
 * layers are derived from the layer, the data is also loaded into a DuckDB table.
 *
 * @param ir The {@link CartoKitIR}.
 * @param source A {@link CartoKitGeoJSONSource}.
 * @param layerId The id of the layer the source belongs to.
 * @param dataIdent The identifier the layer's data is bound to in generated code.
 * @returns A program fragment adding the GeoJSON source to the map.
 */
function codegenGeoJSONSource(
  ir: CartoKitIR,
  source: CartoKitGeoJSONSource,
  layerId: string,
  dataIdent: string
) {
  const deleted = ir.layers[layerId].layout.deleted;
  let createTable = '';

  // If the layer has descendants, generate a CREATE TABLE statement.
  if (getLayerDescendants(ir, layerId).size > 0) {
    createTable = `await conn.query(\`${generateCreateTableStatement(layerId, codegenSourceName(source))}\`);`;
  }

  const data =
    source.location.type === 'api' ? `"${source.location.url}"` : dataIdent;

  return [
    createTable,
    !deleted
      ? `map.addSource("${layerId}", {
      type: "geojson",
      data: ${data}
    });`
      : undefined
  ]
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Generate a program fragment for a {@link CartoKitGeoParquetSource}: load the
 * data into a DuckDB table, then add it to the map as a GeoJSON source.
 *
 * @param source A {@link CartoKitGeoParquetSource}.
 * @param layerId The id of the layer the source belongs to.
 * @param dataIdent The identifier the layer's data is bound to in generated code.
 * @returns A program fragment adding the source to the map.
 */
function codegenGeoParquetSource(
  ir: CartoKitIR,
  source: CartoKitGeoParquetSource,
  layerId: string,
  dataIdent: string
) {
  return codegenDuckDBSource(
    ir,
    generateCreateTableStatement(layerId, codegenSourceName(source)),
    layerId,
    source.table,
    dataIdent
  );
}

/**
 * Generate a program fragment for a {@link CartoKitTableSource}: create the
 * derived table from its parent in DuckDB, then add it to the map as a GeoJSON
 * source.
 *
 * @param source A {@link CartoKitTableSource}.
 * @param layerId The id of the layer the source belongs to.
 * @param dataIdent The identifier the layer's data is bound to in generated code.
 * @returns A program fragment adding the source to the map.
 */
function codegenTableSource(
  ir: CartoKitIR,
  source: CartoKitTableSource,
  layerId: string,
  dataIdent: string
) {
  // A derived table replaces its parent's geometry under the same column name.
  return codegenDuckDBSource(
    ir,
    generateCreateDerivedTableStatement(
      layerId,
      source.location,
      source.table.geometryColumn
    ),
    layerId,
    source.table,
    dataIdent
  );
}

/**
 * Generate a program fragment for a {@link CartoKitPMTilesSource}. MapLibre
 * reads PMTiles through the `pmtiles://` protocol; Mapbox reads the URL directly.
 *
 * @param source A {@link CartoKitPMTilesSource}.
 * @param layerId The id of the layer the source belongs to.
 * @param analysis The {@link CartoKitBackendAnalysis} for the current
 * {@link CartoKitIR}.
 * @returns A program fragment adding the vector source to the map.
 */
function codegenPMTilesSource(
  source: CartoKitPMTilesSource,
  layerId: string,
  analysis: CartoKitBackendAnalysis
) {
  const url =
    analysis.library === 'maplibre'
      ? `pmtiles://${source.location.url}`
      : source.location.url;

  return `map.addSource("${layerId}", {
          type: "vector",
          url: ${JSON.stringify(url)}
        });`;
}

/**
 * Generate a program fragment for a {@link CartoKitSource}.
 *
 * @param layer A {@link CartoKitLayer}.
 * @param ir The {@link CartoKitIR}.
 * @param analysis The {@link CartoKitBackendAnalysis} for the current
 * {@link CartoKitIR}.
 * @returns A program fragment containing the definition of the data source
 * for the {@link CartoKitLayer}.
 */
export function codegenSource(
  layer: CartoKitLayer,
  ir: CartoKitIR,
  analysis: CartoKitBackendAnalysis
): string {
  const dataIdent = camelCase(layer.displayName);

  switch (layer.source.type) {
    case 'geojson':
      return codegenGeoJSONSource(ir, layer.source, layer.id, dataIdent);
    case 'geoparquet':
      return codegenGeoParquetSource(ir, layer.source, layer.id, dataIdent);
    case 'table':
      return codegenTableSource(ir, layer.source, layer.id, dataIdent);
    case 'pmtiles':
      return codegenPMTilesSource(layer.source, layer.id, analysis);
  }
}
