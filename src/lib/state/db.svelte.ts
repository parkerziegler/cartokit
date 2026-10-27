import type { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';

export const db = $state<{
  value: {
    db: AsyncDuckDB;
    worker: Worker;
    conn: AsyncDuckDBConnection;
  } | null;
}>({ value: null });
