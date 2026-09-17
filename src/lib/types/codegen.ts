/**
 * Represents the set of user-selectable language backends for code generation.
 */
type CartoKitLanguageBackend = 'javascript' | 'typescript';

/**
 * Represents the set of user-selectable library backends for code generation.
 */
type CartoKitLibraryBackend = 'mapbox' | 'maplibre';

/**
 * Represents the full set of languages for all code generation.
 */
export type CartokitCodegenLanguage =
  CartoKitLanguageBackend | 'css' | 'html' | 'json';

/**
 * Represents user configurable options for the cartokit compiler backend.
 */
export interface CartoKitBackend {
  /** The language backend for code generation. */
  language: CartoKitLanguageBackend;
  /** The library backend for code generation. */
  library: CartoKitLibraryBackend;
}

/**
 * Represents the analysis information for the CartoKit IR, used by code
 * generation.
 */
export interface CartoKitBackendAnalysis extends CartoKitBackend {
  /**
   * A Boolean value indicating whether \@turf/turf is required to support
   * cross-geometry transformations.
   */
  isTurfRequired: boolean;
  /**
   * A Boolean value indicating whether we need to insert a function to fetch
   * GeoJSON hosted at a remote URL.
   */
  isFetchGeoJSONRequired: boolean;
  /**
   * A Boolean value indicating whether we need to insert an import of the
   * GeoJSON namespace.
   */
  isGeoJSONNamespaceRequired: boolean;
  /**
   * A Boolean value indicating whether we need to include the PMTiles client
   * library.
   */
  isPMTilesRequired: boolean;
}

/**
 * Represents a file produced by cartokit's code generation.
 */
export interface CartokitCodegenFile {
  /** The name of the file. */
  path: string;
  /** The program text. */
  text: string;
  /** The language of the generated code. */
  language: CartokitCodegenLanguage;
}
