import type { Geometry } from 'geojson';

import type { CartoKitLayer, VectorGeometry } from '$lib/types';
import type { DuckDBColumn } from '$lib/types/db';

/**
 * Represents a per-attribute catalog entry for a quantitative attribute,
 * including pre-computed classification statistics.
 */
export interface QuantitativeAttributeEntry {
  /** The type of the attribute, 'quantitative'. */
  type: 'quantitative';
  /** The minimum value of the attribute. */
  min: number;
  /** The maximum value of the attribute. */
  max: number;
  /** The domain of the attribute. */
  domain: number[];
  /** The number of unique values for the attribute. */
  unique: number;
  /** The pre-computed quantile breaks for the attribute. */
  Quantile: {
    3: { breaks: number[] };
    4: { breaks: number[] };
    5: { breaks: number[] };
    6: { breaks: number[] };
    7: { breaks: number[] };
    8: { breaks: number[] };
    9: { breaks: number[] };
  };
  /** The pre-computed equal interval breaks for the attribute. */
  'Equal Interval': {
    3: { breaks: number[] };
    4: { breaks: number[] };
    5: { breaks: number[] };
    6: { breaks: number[] };
    7: { breaks: number[] };
    8: { breaks: number[] };
    9: { breaks: number[] };
  };
  /** The pre-computed Jenks breaks for the attribute. */
  Jenks: {
    3: { breaks: number[] };
    4: { breaks: number[] };
    5: { breaks: number[] };
    6: { breaks: number[] };
    7: { breaks: number[] };
    8: { breaks: number[] };
    9: { breaks: number[] };
  };
}

/** Represents a per-attribute catalog entry for a categorical attribute. */
export interface CategoricalAttributeEntry {
  /** The type of the attribute, 'categorical'. */
  type: 'categorical';
  /** The unique values of the attribute. */
  values: string[] | number[] | boolean[];
  /** The number of unique values for the attribute. */
  unique: number;
}

/** Represents a per-attribute entry in the {@link Catalog}. */
export type AttributeEntry =
  QuantitativeAttributeEntry | CategoricalAttributeEntry;

/** Represents a catalog entry for a {@link CartoKitLayer} backed by GeoJSON. */
interface GeoJSONCatalogEntry {
  /** The type of the catalog entry ('geojson'). */
  type: 'geojson';
  /** The geometry type of GeoJSON features. */
  geometryType: Geometry['type'];
  /** The number of features in the layer. */
  count: number;
  /** A dictionary mapping attribute names to entries. */
  attributes: Record<string, AttributeEntry>;
}

/** Represents a catalog entry for a {@link CartoKitLayer} backed by GeoParquet. */
export interface GeoParquetCatalogEntry {
  /** The type of the catalog entry ('geoparquet'). */
  type: 'geoparquet';
  /** The geometry type of the GeoParquet file's primary geometry column. */
  geometryType: Geometry['type'];
  /** The number of features in the layer. */
  count: number;
  /** A dictionary mapping attribute names to entries. */
  attributes: Record<string, AttributeEntry>;
  /**
   * The {@link DuckDBColumn}s of the layer's table, used to query its features.
   */
  columns: DuckDBColumn[];
  /**
   * The name of the geometry column in the GeoParquet file, used to query the
   * file directly in generated code.
   */
  geometryColumn: string;
}

/** Represents a catalog entry for a {@link CartoKitLayer} backed by PMTiles. */
interface PMTilesCatalogEntry {
  /** The type of the catalog entry ('pmtiles'). */
  type: 'pmtiles';
  /** The geometry type of the vector tile source layer. */
  geometryType: VectorGeometry;
  /** The number of features in the layer. */
  count: number;
  /** A dictionary mapping attribute names to entries. */
  attributes: Record<string, AttributeEntry>;
}

/** Represents a layer entry in the catalog. */
type CatalogEntry =
  GeoJSONCatalogEntry | GeoParquetCatalogEntry | PMTilesCatalogEntry;

/** Represents a catalog mapping layerIds to layer metadata. */
export type Catalog = Record<CartoKitLayer['id'], CatalogEntry>;
