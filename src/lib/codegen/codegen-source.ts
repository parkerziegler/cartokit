import { camelCase } from 'lodash-es';

import { literal } from '#lib/codegen/utils.ts';
import type { CartoKitBackendAnalysis } from '#lib/types/codegen.ts';
import type { DuckDBTable } from '#lib/types/db.ts';
import type { CartoKitIR, CartoKitLayer } from '#lib/types/index.ts';
import type {
  CartoKitGeoJSONSource,
  CartoKitGeoParquetSource,
  CartoKitPMTilesSource,
  CartoKitTableSource
} from '#lib/types/source.ts';
import {
  generateCreateDerivedTableStatement,
  generateCreateTableStatement,
  generateSelectStatement
} from '#lib/utils/db.ts';
import {
  hasDescendantsRequiringData,
  isLayerDataRequired
} from '#lib/utils/ir.ts';

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
export function codegenDuckDBFileRegistrations(ir: CartoKitIR): string {
  const promises = Object.values(ir.layers).flatMap((layer) => {
    const isGeoParquetWithRequiredData =
      layer.source.type === 'geoparquet' && isLayerDataRequired(ir, layer.id);
    const isGeoJSONWithDescendants =
      layer.source.type === 'geojson' &&
      hasDescendantsRequiringData(ir, layer.id);

    if (
      layer.source.location.type === 'file' &&
      (isGeoParquetWithRequiredData || isGeoJSONWithDescendants)
    ) {
      return `db.registerFileURL(
        ${literal(layer.source.location.file.name)},
        new URL(
          ${literal(`/data/${layer.source.location.file.name}`)},
          window.location.href
        ).href,
        duckdb.DuckDBDataProtocol.HTTP,
        false
      )`;
    }

    return [];
  });

  switch (promises.length) {
    case 0:
      return '';
    case 1:
      return `await ${promises};`;
    default:
      return `await Promise.all([${promises.join(', ')}]);`;
  }
}

interface CodegenDuckDBSourceParams {
  ir: CartoKitIR;
  createStatement: string;
  layerId: string;
  table: DuckDBTable;
  dataIdent: string;
}

/**
 * Generate a program fragment that creates a layer's table in DuckDB, queries
 * its features, and adds them to the map as a GeoJSON source.
 *
 * @param params The {@link CodegenDuckDBSourceParams}.
 * @param params.ir The {@link CartoKitIR}.
 * @param params.createStatement The SQL CREATE TABLE statement for the layer's
 * table.
 * @param params.layerId The layer id.
 * @param params.table The {@link DuckDBTable} the statement creates.
 * @param params.dataIdent The identifier the layer's data is bound to in
 * generated code.
 * @returns A (potentially empty) program fragment adding the source to the
 * map.
 */
function codegenDuckDBSource({
  ir,
  createStatement,
  layerId,
  table,
  dataIdent
}: CodegenDuckDBSourceParams) {
  // If the layer itself is soft-deleted, check to see if it has descendants
  // that still require it. If so, generate a statement to create the table.
  if (ir.layers[layerId].layout.deleted) {
    return hasDescendantsRequiringData(ir, layerId)
      ? `await conn.query(\`${createStatement}\`);`
      : '';
  }

  const selectStatement = generateSelectStatement(layerId, table);
  return [
    `const ${dataIdent} = await conn.query(\`
    ${createStatement}
    ${selectStatement}
  \`);`,
    `map.addSource(${literal(layerId)}, {
  type: "geojson",
  data: toFeatureCollection(${dataIdent})
});`
  ].join('\n\n');
}

interface CodegenSourceParams<T> {
  ir: CartoKitIR;
  source: T;
  layerId: string;
  dataIdent: string;
}

/**
 * Generate a program fragment for a {@link CartoKitGeoJSONSource}.
 *
 * If other layers are derived from this layer, the GeoJSON data is also loaded
 * into a DuckDB table.
 *
 * @param params The {@link CodegenSourceParams}.
 * @param params.ir The {@link CartoKitIR}.
 * @param params.source A {@link CartoKitGeoJSONSource}.
 * @param params.layerId The layer id.
 * @returns A program fragment adding the GeoJSON source to the map.
 */
function codegenGeoJSONSource({
  ir,
  source,
  layerId
}: Omit<CodegenSourceParams<CartoKitGeoJSONSource>, 'dataIdent'>) {
  const deleted = ir.layers[layerId].layout.deleted;
  let createTable = '';

  // Check if any descendants of this layer still require its data; if so,
  // ensure we generate a CREATE TABLE statement for it.
  if (hasDescendantsRequiringData(ir, layerId)) {
    createTable = `await conn.query(\`${generateCreateTableStatement(layerId, codegenSourceName(source))}\`);`;
  }

  const data =
    source.location.type === 'api'
      ? source.location.url
      : `/data/${source.location.file.name}`;

  return [
    createTable,
    !deleted
      ? `map.addSource(${literal(layerId)}, {
  type: "geojson",
  data: ${literal(data)}
});`
      : undefined
  ]
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Generate a program fragment for a {@link CartoKitGeoParquetSource}.
 *
 * @param params The {@link CodegenSourceParams}.
 * @param params.ir The {@link CartoKitIR}.
 * @param params.source A {@link CartoKitGeoParquetSource}.
 * @param params.layerId The layer id.
 * @param params.dataIdent The identifier the layer's data is bound to in
 * generated code.
 * @returns A program fragment adding the source to the map.
 */
function codegenGeoParquetSource({
  ir,
  source,
  layerId,
  dataIdent
}: CodegenSourceParams<CartoKitGeoParquetSource>) {
  return codegenDuckDBSource({
    ir,
    createStatement: generateCreateTableStatement(
      layerId,
      codegenSourceName(source)
    ),
    layerId,
    table: source.table,
    dataIdent
  });
}

/**
 * Generate a program fragment for a {@link CartoKitTableSource}: create the
 * derived table from its parent in DuckDB, then add it to the map as a GeoJSON
 * source.
 *
 * @param params The {@link CodegenSourceParams}.
 * @param params.ir The {@link CartoKitIR}.
 * @param params.source A {@link CartoKitTableSource}.
 * @param params.layerId The layer id.
 * @param params.dataIdent The identifier the layer's data is bound to in
 * generated code.
 * @returns A program fragment adding the source to the map.
 */
function codegenTableSource({
  ir,
  source,
  layerId,
  dataIdent
}: CodegenSourceParams<CartoKitTableSource>) {
  return codegenDuckDBSource({
    ir,
    createStatement: generateCreateDerivedTableStatement(
      layerId,
      source.location,
      source.table.geometryColumn
    ),
    layerId,
    table: source.table,
    dataIdent
  });
}

/**
 * Generate a program fragment for a {@link CartoKitPMTilesSource}. MapLibre
 * reads PMTiles through the `pmtiles://` protocol; Mapbox reads the URL directly.
 *
 * @param source A {@link CartoKitPMTilesSource}.
 * @param layerId The layer id.
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

  return `map.addSource(${literal(layerId)}, {
  type: "vector",
  url: ${literal(url)}
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
      return codegenGeoJSONSource({
        ir,
        source: layer.source,
        layerId: layer.id
      });
    case 'geoparquet':
      return codegenGeoParquetSource({
        ir,
        source: layer.source,
        layerId: layer.id,
        dataIdent
      });
    case 'table':
      return codegenTableSource({
        ir,
        source: layer.source,
        layerId: layer.id,
        dataIdent
      });
    case 'pmtiles':
      return codegenPMTilesSource(layer.source, layer.id, analysis);
  }
}
