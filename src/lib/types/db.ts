import type { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';

/** A DuckDB instance paired with an open connection to it. */
export interface DuckDBState {
  /** The DuckDB instance. */
  db: AsyncDuckDB;
  /** An open connection to the DuckDB instance. */
  conn: AsyncDuckDBConnection;
}

/** Valid return types of DuckDB's GEOMETRY_TYPE enum. */
export type DuckDBGeometryType =
  | 'POINT'
  | 'LINESTRING'
  | 'POLYGON'
  | 'MULTIPOINT'
  | 'MULTILINESTRING'
  | 'MULTIPOLYGON'
  | 'GEOMETRYCOLLECTION';

/** A column of a DuckDB table, as reported by DESCRIBE. */
export interface DuckDBColumn {
  /** The name of the column. */
  column_name: string;
  /** The type of the column (e.g., VARCHAR, DOUBLE, etc.). */
  column_type: string;
}

/** A DuckDB table for a layer. */
export interface DuckDBTable {
  /** The {@link DuckDBColumn}s of the normalized table. */
  columns: DuckDBColumn[];
  /** The name of the geometry column. */
  geometryColumn: string;
}
