/** Represents the set of language backends for code generation. */
type CartoKitLanguageBackend = 'javascript' | 'typescript';

/** Represents the set of library backends for code generation. */
type CartoKitLibraryBackend = 'mapbox' | 'maplibre';

/** Represents the full set of languages for all code generation. */
export type CartokitCodegenLanguage =
  CartoKitLanguageBackend | 'css' | 'html' | 'json';

/**
 * Represents the set of identifiers for code generation backends.
 *
 * @property language The language backend for code generation.
 * @property library The library backend for code generation.
 */
export interface CartoKitBackend {
  language: CartoKitLanguageBackend;
  library: CartoKitLibraryBackend;
}

/**
 * Represents the analysis information for the CartoKit IR, used by code genera-
 * tion.
 *
 * @property isTurfRequired A Boolean value indicating whether \@turf/turf is
 * required to support cross-geometry transformations.
 * @property isFetchGeoJSONRequired A Boolean value indicating whether we need
 * to insert a function to fetch GeoJSON hosted at a remote URL.
 * @property isGeoJSONNamespaceRequired A Boolean value indicating whether we
 * need to insert an import of the GeoJSON namespace.
 * @property isPMTilesRequired A Boolean value indicating whether we need to
 * include the PMTiles client library.
 */
export interface CartoKitBackendAnalysis extends CartoKitBackend {
  isTurfRequired: boolean;
  isFetchGeoJSONRequired: boolean;
  isGeoJSONNamespaceRequired: boolean;
  isPMTilesRequired: boolean;
}

/**
 * Represents a file produced by cartokit's code generation.
 */
export interface CartokitCodegenFile {
  /** The name of the file. */
  name: string;
  /** The program text. */
  text: string;
  /** The language of the generated code. */
  language: CartokitCodegenLanguage;
}
