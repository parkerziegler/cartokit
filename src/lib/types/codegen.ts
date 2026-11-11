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
   * A Boolean value indicating whether we need to include the PMTiles client
   * library.
   */
  isPMTilesRequired: boolean;
  /**
   * A Boolean value indicating whether we need to include DuckDB to load
   * GeoParquet sources or derive layers from other layers.
   */
  isDuckDBRequired: boolean;
  /**
   * A Boolean value indicating whether we need to include DuckDBDataProtocol to
   * support registering local GeoParquet files.
   */
  isDuckDBDataProtocolRequired: boolean;
  /**
   * A Boolean value indicating whether we need the DuckDB instance to register
   * local GeoParquet files or uploaded GeoJSON files read by derived layers.
   */
  isDuckDBFileRegistrationRequired: boolean;
}

/**
 * Represents a file containing program text produced by cartokit's code
 * generation.
 */
export interface CartokitCodegenProgramFile {
  /** The relative path of the file on disk. */
  path: string;
  /** The program text. */
  text: string;
  /** The language of the generated code. */
  language: CartokitCodegenLanguage;
}

/**
 * Represents a file containing data produced by cartokit's code generation.
 */
export interface CartokitCodegenDataFile {
  /** The relative path of the file on disk. */
  path: string;
  /**
   * The file contents as bytes.
   * The Uint8Array is a view on the underlying bytes of the ArrayBuffer.
   */
  bytes: Uint8Array<ArrayBuffer>;
}
