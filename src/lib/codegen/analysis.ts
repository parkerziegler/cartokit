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
function isTurfRequired({ layers }: CartoKitIR): boolean {
  return Object.values(layers).some(
    (layer) =>
      layer.data.transformations.filter(
        (transformation) => transformation.type === 'geometric'
      ).length > 0
  );
}

/**
 * Determine whether lodash's flow function is required for chaining trans-
 * formations.
 *
 * @param ir – The CartoKit IR.
 * @returns - A Boolean value indicating whether lodash's flow function is
 * required.
 */
function isLodashFlowRequired({ layers }: CartoKitIR): boolean {
  return Object.values(layers).some(
    (layer) => layer.data.transformations.length > 1
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
function isFetchGeoJSONRequired({ layers }: CartoKitIR): boolean {
  return Object.values(layers).some(
    (layer) => layer.data.url && layer.data.transformations.length > 0
  );
}

/**
 * Determine whether we need to insert an import of the GeoJSON
 * FeatureCollection type. This is only relevant for TypeScript codegen.
 *
 * @param ir – The CartoKit IR.
 * @param languageBackend – The @see{CartoKitLanguageBackend} for the analysis.
 */
export function isFeatureCollectionRequired(
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
  languageBackend: CartoKitBackend['language']
): CartoKitBackendAnalysis {
  return {
    isTurfRequired: isTurfRequired(ir),
    isLodashFlowRequired: isLodashFlowRequired(ir),
    isFetchGeoJSONRequired: isFetchGeoJSONRequired(ir),
    isFeatureCollectionRequired: isFeatureCollectionRequired(
      ir,
      languageBackend
    )
  };
}
