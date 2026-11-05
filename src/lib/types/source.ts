import type { DuckDBTable } from '$lib/types/db';
import type { Transformation } from '$lib/types/transformation';

/**
 * Represents the underlying data and metadata of a GeoJSON layer. This object
 * maintains two copies of a layer's GeoJSON data in memory:
 *
 *   1. The source GeoJSON at the time of layer creation. All accumulated trans-
 *      formations are executed against this copy to produce the current
 *      GeoJSON.
 *   2. The current GeoJSON of the layer, used for display.
 *
 * @property type The type of the source, 'geojson'.
 * @property location The location of the source, either a remote API endpoint
 * or a local file on disk.
 * @property table The {@link DuckDBTable} storing the source's data.
 */
export interface CartoKitGeoJSONSource {
  type: 'geojson';
  location:
    | {
        type: 'api';
        url: string;
      }
    | {
        type: 'file';
        file: File;
      };
  table: DuckDBTable;
}

/** Represents a GeoParquet data source. */
export interface CartoKitGeoParquetSource {
  /** The type of the data source, 'geoparquet'. */
  type: 'geoparquet';
  /**
   * The location of the source, either a remote API endpoint or a local file on
   * disk.
   */
  location:
    | {
        type: 'api';
        url: string;
      }
    | {
        type: 'file';
        file: File;
      };
  /** The {@link DuckDBTable} storing the source's data. */
  table: DuckDBTable;
}

/**
 * Represents the possible geometry types of a vector layer.
 */
export type VectorGeometry = 'Point' | 'Line' | 'Polygon';

/**
 * Represents the possible attribute types of a vector layer, assuming encoding
 * using Tippecanoe: https://github.com/felt/tippecanoe.
 */
export type VectorAttribute =
  | {
      type: 'number';
      attribute: string;
      min: number;
      max: number;
      values: number[];
      count: number;
    }
  | {
      type: 'string';
      attribute: string;
      values: string[];
      count: number;
    }
  | {
      type: 'boolean';
      attribute: string;
      values: boolean[];
      count: number;
    };

/**
 * Represents the tilestats associated with a vector layer, assuming encoding
 * using Tippecanoe: https://github.com/felt/tippecanoe.
 */
export interface TileStats {
  layers: {
    layer: string;
    count: number;
    geometry: VectorGeometry;
    attributes: VectorAttribute[];
  }[];
}

/**
 * Represents an entry in the vector_layers Array of a TileJSON-compliant vector
 * tile source: https://github.com/mapbox/tilejson-spec/tree/master/3.0.0#33-vector_layers
 */
export interface VectorLayer {
  id: string;
  description: string;
  minzoom: number;
  maxzoom: number;
  fields: Record<string, 'Number' | 'String' | 'Boolean'>;
}

/**
 * Represents the underlying data and metadata of a vector tile layer.
 *
 * @property type The type of the source, 'pmtiles'.
 * @property location The location of the source, a remote API endpoint.
 * @property sourceLayerId The id of the source layer in the vector tile archive.
 * @property tilestats The {@link TileStats} metadata of the vector tile source.
 * @property vectorLayers The {@link VectorLayer} metadata of the vector tile source.
 */
export interface CartoKitPMTilesSource {
  type: 'pmtiles';
  location: {
    type: 'api';
    url: string;
  };
  sourceLayerId: string;
  tilestats: TileStats;
  vectorLayers: VectorLayer[];
}

/** Represents a data source derived from another layer's DuckDB table. */
export interface CartoKitTableSource {
  /** The type of the data source, 'table'. */
  type: 'table';
  /**
   * The location of the source, i.e., the transformation needed to rebuild it
   * from its parent layer's table.
   */
  location: {
    type: 'table';
    /** The id of the layer whose table the source is derived from. */
    parentLayerId: string;
    /** The {@link Transformation} applied to the parent layer's table. */
    transformation: Transformation;
  };
  /** The {@link DuckDBTable} storing the source's data. */
  table: DuckDBTable;
}

/**
 * Represents the possible data sources for a layer.
 */
export type CartoKitSource =
  | CartoKitGeoJSONSource
  | CartoKitGeoParquetSource
  | CartoKitPMTilesSource
  | CartoKitTableSource;
