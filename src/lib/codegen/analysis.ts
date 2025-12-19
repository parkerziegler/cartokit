import type {
  CartoKitBackend,
  CartoKitBackendAnalysis,
  CartoKitIR
} from '$lib/types';

/**
 * Determine whether @turf/turf is required for cross-geometry transformations.
 *
 * @param ir – The CartoKit IR.
 * @returns – A Boolean value indicating whether @turf/turf is required.
 */
function isTurfRequired(ir: CartoKitIR): boolean {
  return Object.values(ir.layers).some(
    (layer) =>
      layer.data.transformations.filter(
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
    (layer) => layer.data.url && layer.data.transformations.length > 0
  );
}

/**
 * Determine whether we need to insert an import of the GeoJSON namespace.
 * This is only relevant for TypeScript codegen.
 *
 * @param ir – The CartoKit IR.
 * @param languageBackend – The @see{CartoKitLanguageBackend} for the analysis.
 */
export function isGeoJSONNamespaceRequired(
  ir: CartoKitIR,
  languageBackend: CartoKitBackend['language']
): boolean {
  return (
    languageBackend === 'typescript' &&
    Object.values(ir.layers).some(
      (layer) => layer.data.transformations.length > 0
    )
  );
}

/**
 * Analyze the CartoKit IR to glean relevant information for code generation.
 *
 * @param ir – The CartoKit IR.
 * @param languageBackend – The @see{CartoKitLanguageBackend} for the analysis.
 * @returns – A CartoKit backend analysis.
 */
export function analyzeIR(
  ir: CartoKitIR,
  languageBackend: CartoKitBackend['language'],
  libraryBackend: CartoKitBackend['library']
): CartoKitBackendAnalysis {
  return {
    language: languageBackend,
    library: libraryBackend,
    isTurfRequired: isTurfRequired(ir),
    isFetchGeoJSONRequired: isFetchGeoJSONRequired(ir),
    isGeoJSONNamespaceRequired: isGeoJSONNamespaceRequired(ir, languageBackend)
  };
}
