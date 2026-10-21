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
  /** The name of the geometry column in the source, prior to normalization. */
  geometryColumn: string;
}
