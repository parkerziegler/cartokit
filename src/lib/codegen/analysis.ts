import type { CartoKitIR } from '#lib/types/index.ts';
import type {
  CartoKitBackend,
  CartoKitBackendAnalysis
} from '#lib/types/codegen.ts';
import { hasRequiredDependents, isLayerDataRequired } from '#lib/utils/ir.ts';

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
 * derive layers from other layers. Orphaned soft-deleted layers are ignored.
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
 * Determine whether we need the DuckDB instance and DuckDBDataProtocol to
 * register files, either local GeoParquet files or uploaded GeoJSON files read
 * by derived layers.
 *
 * @param ir The current {@link CartoKitIR}.
 * @returns A Boolean value indicating whether file registration is required.
 */
function isDuckDBFileRegistrationRequired(ir: CartoKitIR): boolean {
  return Object.values(ir.layers).some(
    (layer) =>
      layer.source.location.type === 'file' &&
      ((layer.source.type === 'geoparquet' &&
        isLayerDataRequired(ir, layer.id)) ||
        (layer.source.type === 'geojson' &&
          hasRequiredDependents(ir, layer.id)))
  );
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
