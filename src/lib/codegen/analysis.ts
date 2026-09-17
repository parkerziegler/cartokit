import type { CartoKitIR } from '$lib/types';
import type {
  CartoKitBackend,
  CartoKitBackendAnalysis
} from '$lib/types/codegen';

/**
 * Determine whether @turf/turf is required for cross-geometry transformations.
 *
 * @param ir – The CartoKit IR.
 * @returns – A Boolean value indicating whether @turf/turf is required.
 */
function isTurfRequired(ir: CartoKitIR): boolean {
  return Object.values(ir.layers).some(
    (layer) =>
      layer.source.type === 'geojson' &&
      layer.source.transformations.filter(
        (transformation) => transformation.kind === 'geometric'
      ).length > 0
  );
}

/**
 * Determine whether we need to insert a function to fetch GeoJSON hosted at a
 * remote URL.
 *
 * @param ir – The CartoKit IR.
 * @returns – A Boolean value indicting whether we need to insert a function to
 * fetch GeoJSON hosted at a remote URL.
 */
function isFetchGeoJSONRequired(ir: CartoKitIR): boolean {
  return Object.values(ir.layers).some(
    (layer) =>
      layer.source.type === 'geojson' &&
      layer.source.location.type === 'api' &&
      layer.source.transformations.length > 0
  );
}

/**
 * Determine whether we need to insert an import of the GeoJSON namespace.
 * This is only relevant for TypeScript codegen.
 *
 * @param ir The CartoKit IR.
 * @param backend The code generation {@link CartoKitBackend} for the analysis.
 * @returns A Boolean value indicating whether we need to include the
 * @types/geojson devDependency.
 */
export function isGeoJSONNamespaceRequired(
  ir: CartoKitIR,
  backend: CartoKitBackend
): boolean {
  return (
    backend.language === 'typescript' &&
    Object.values(ir.layers).some(
      (layer) =>
        layer.source.type === 'geojson' &&
        layer.source.transformations.length > 0
    )
  );
}

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
    Object.values(ir.layers).some((layer) => layer.source.type === 'vector')
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
    isTurfRequired: isTurfRequired(ir),
    isFetchGeoJSONRequired: isFetchGeoJSONRequired(ir),
    isGeoJSONNamespaceRequired: isGeoJSONNamespaceRequired(ir, backend),
    isPMTilesRequired: isPMTilesRequired(ir, backend)
  };
}
