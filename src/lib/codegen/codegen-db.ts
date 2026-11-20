import { inferCRS } from '#lib/utils/crs.ts';

/**
 * Generate the src/db.{js,ts} module that initializes DuckDB and supports
 * querying data from DuckDB as GeoJSON.
 *
 * @returns Program text for the src/db.{js,ts} module.
 */
export function codegenDB(): string {
  const imports = `import * as duckdb from "@duckdb/duckdb-wasm";
import type { Feature, FeatureCollection } from "geojson";`;

  const bundles = `const DUCKDB_BUNDLES = duckdb.getJsDelivrBundles();`;

  const initDB = `export async function initDB() {
  const bundle = await duckdb.selectBundle(DUCKDB_BUNDLES);
  const workerURL = URL.createObjectURL(
    new Blob([\`importScripts("\${bundle.mainWorker}");\`], {
      type: 'text/javascript'
    })
  );

  // Instantiate the asynchronous version of DuckDB-wasm.
  const worker = new Worker(workerURL);
  const logger = new duckdb.ConsoleLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  URL.revokeObjectURL(workerURL);

  // Cast types that Arrow would otherwise surface as BigInt or Decimal objects
  // to plain numbers. MapLibre cannot serialize these when tiling GeoJSON.
  await db.open({
    query: {
      castBigIntToDouble: true,
      castDecimalToDouble: true,
      castTimestampToDate: true
    }
  });

  // Install and load the Spatial extension at startup.
  // See https://github.com/duckdb/duckdb-wasm/issues/2199 for why the call to
  // duckdb_coordinate_systems is necessary to support GeoParquet loading.
  const conn = await db.connect();
  await conn.query(\`
SELECT * FROM duckdb_coordinate_systems();
INSTALL spatial;
LOAD spatial;

${inferCRS()}
\`);

  return { db, worker, conn };
}`;

  const toFeatureCollection = `export function toFeatureCollection(
  results: Pick<Awaited<ReturnType<duckdb.AsyncDuckDBConnection["query"]>>, "toArray">
): FeatureCollection {
  const features = results
    .toArray()
    .map((row: { toJSON: () => { geom: string; [key: string]: unknown } }) => {
      const { geom, ...properties } = row.toJSON();

      return {
        type: 'Feature',
        properties,
        geometry: JSON.parse(geom)
      } as Feature;
    });

  return {
    type: 'FeatureCollection',
    features
  };
}`;

  return [imports, bundles, initDB, toFeatureCollection].join('\n\n');
}
