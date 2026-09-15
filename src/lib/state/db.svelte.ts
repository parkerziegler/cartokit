import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: duckdb_wasm,
    mainWorker: mvp_worker
  },
  eh: {
    mainModule: duckdb_wasm_eh,
    mainWorker: eh_worker
  }
};

/**
 * Initialize a DuckDB in-memory database.
 *
 * @returns An Object continaing:
 *  1. The initialized {@link duckdb.AsyncDuckDB} instance
 *  2. A reference to the {@link Worker} thread running the instance.
 *  3. The active {@link duckdb.AsyncDuckDBConnection}.
 */
export async function initDB() {
  // Select a bundle based on browser checks
  const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);

  // Instantiate the asynchronous version of DuckDB-wasm
  const worker = new Worker(bundle.mainWorker!);
  const logger = new duckdb.ConsoleLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

  // Install and load the Spatial extension at startup.
  const conn = await db.connect();
  await conn.query(`INSTALL spatial;
LOAD spatial;`);

  return { db, worker, conn };
}

export const db = $state<{
  value: {
    db: duckdb.AsyncDuckDB;
    worker: Worker;
    conn: duckdb.AsyncDuckDBConnection;
  } | null;
}>({ value: null });
