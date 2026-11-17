import type { CartoKitIR } from '#lib/types/index.ts';
import type {
  CartoKitBackend,
  CartoKitBackendAnalysis
} from '#lib/types/codegen.ts';
import {
  hasDescendantsRequiringData,
  isLayerDataRequired
} from '#lib/utils/ir.ts';

/**
 * Determine whether we need to include the PMTiles client library.
 *
 * @param ir The current {@link CartoKitIR}.
 * @param backend The code generation {@link CartoKitBackend} for the analysis.
 * @returns A Boolean value indicating whether we need to include the PMTiles
 * client library.
 */
export function isPMTilesRequired(
  ir: CartoKitIR,
  backend: CartoKitBackend
): boolean {
  return (
    backend.library === 'maplibre' &&
    Object.values(ir.layers).some((layer) => layer.source.type === 'pmtiles')
  );
}

/**
 * Determine whether we need to include DuckDB to load GeoParquet sources or
 * derive layers from other layers.
 *
 * The call to isLayerDataRequired helps to guard against a case like the
 * following:
 *
 * 1. A user uploads a GeoParquet file and applies a transformation, generating
 *    a descedant layer.
 * 2. They soft delete the parent layer, flipping its deleted flag to true.
 * 3. They later delete the descendant layer, orphaning the parent layer in the
 *    the dependency graph.
 *
 * @param ir The current {@link CartoKitIR}.
 * @returns A Boolean value indicating whether DuckDB is required.
 */
function isDuckDBRequired(ir: CartoKitIR): boolean {
  return Object.values(ir.layers).some(
    (layer) =>
      (layer.source.type === 'geoparquet' || layer.source.type === 'table') &&
      isLayerDataRequired(ir, layer.id)
  );
}

/**
 * Determine whether we need to register files in DuckDB's virtual file system.
 * These will either be local GeoParquet files or local GeoJSON files read
 * by derived layers.
 *
 * @param ir The current {@link CartoKitIR}.
 * @returns A Boolean value indicating whether file registration is required.
 */
function isDuckDBFileRegistrationRequired(ir: CartoKitIR): boolean {
  return Object.values(ir.layers).some((layer) => {
    const isFileUpload = layer.source.location.type === 'file';

    const isGeoParquetWithRequiredData =
      layer.source.type === 'geoparquet' && isLayerDataRequired(ir, layer.id);
    const isGeoJSONWithDescendants =
      layer.source.type === 'geojson' &&
      hasDescendantsRequiringData(ir, layer.id);

    return (
      isFileUpload && (isGeoParquetWithRequiredData || isGeoJSONWithDescendants)
    );
  });
}

/**
 * Analyze the CartoKit IR to glean relevant information for code generation.
 *
 * @param ir The CartoKit IR.
 * @param backend The {@link CartoKitBackend} for the analysis.
 * @returns A {@link CartoKitBackendAnalysis}.
 */
export function analyzeIR(
  ir: CartoKitIR,
  backend: CartoKitBackend
): CartoKitBackendAnalysis {
  return {
    language: backend.language,
    library: backend.library,
    isPMTilesRequired: isPMTilesRequired(ir, backend),
    isDuckDBRequired: isDuckDBRequired(ir),
    isDuckDBFileRegistrationRequired: isDuckDBFileRegistrationRequired(ir)
  };
}
