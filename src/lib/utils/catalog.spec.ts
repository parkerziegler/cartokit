import * as fs from 'node:fs';
import { createRequire } from 'node:module';
import * as path from 'node:path';
import * as url from 'node:url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const require = createRequire(import.meta.url);

import type { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
import {
  createDuckDB,
  NODE_RUNTIME,
  VoidLogger
} from '@duckdb/duckdb-wasm/blocking';
import type { FeatureCollection } from 'geojson';
import { beforeAll, describe, expect, test } from 'vitest';

import type { CartoKitLayer, QuantitativeStepCount } from '$lib/types';
import type { Catalog, QuantitativeAttributeEntry } from '$lib/types/catalog';
import type { DuckDBTable } from '$lib/types/db';
import { buildCatalog } from '$lib/utils/catalog';
import { createTable } from '$lib/utils/db';

// Fixture file information.
const fileName = 'us-counties-unemployment.json';
const fixture = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, `../../../tests/data/all/${fileName}`),
    'utf8'
  )
);

/**
 * Initialize an in-memory DuckDB database using the blocking Node.js build of
 * DuckDB-wasm, which runs on the main thread and requires no Worker.
 *
 * @returns The initialized database and its active connection.
 */
async function initTestDB() {
  const db = await createDuckDB(
    {
      mvp: {
        mainModule: require.resolve('@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm'),
        mainWorker: ''
      },
      eh: {
        mainModule: require.resolve('@duckdb/duckdb-wasm/dist/duckdb-eh.wasm'),
        mainWorker: ''
      }
    },
    new VoidLogger(),
    NODE_RUNTIME
  );
  await db.instantiate();
  db.open({
    query: {
      castBigIntToDouble: true,
      castDecimalToDouble: true,
      castTimestampToDate: true
    }
  });

  const conn = db.connect();
  conn.query('INSTALL spatial; LOAD spatial;');

  // conn is typed as a synchronous DuckDBConnection from the Node.js build.
  // Casting it to an AsyncDuckDBConnection is fine, since awaiting a
  // synchronous value just returns the value itself.
  return { db, conn: conn as unknown as AsyncDuckDBConnection };
}

/**
 * Select the {@link QuantitativeAttributeEntry} for a layer from a built
 * catalog.
 *
 * @param catalog The built {@link Catalog}.
 * @param layerId The layer id to query.
 * @returns An Array of {@link QuantitativeAttributeEntry} from the catalog.
 */
function selectQuantitativeEntries(catalog: Catalog, layerId: string) {
  return Object.values(catalog[layerId].attributes).filter(
    (entry): entry is QuantitativeAttributeEntry =>
      entry.kind === 'Quantitative'
  );
}

describe('buildCatalog', () => {
  let conn: AsyncDuckDBConnection;
  const tables: Record<string, DuckDBTable> = {};

  beforeAll(async () => {
    const testDB = await initTestDB();
    conn = testDB.conn;

    // Register the layer's data as a file in DuckDB's virtual file system,
    // then create its table by reading from the registered file name.
    testDB.db.registerFileText(fileName, JSON.stringify(fixture));

    tables[layer.id] = await createTable(
      testDB.db as unknown as AsyncDuckDB,
      conn,
      layer.id,
      { type: 'api', url: fileName }
    );
  });

  const layer: CartoKitLayer = {
    id: 'us_counties_unemployment__1',
    type: 'Polygon',
    displayName: 'US Counties Unemployment',
    layout: {
      visible: true,
      z: 0,
      tooltip: {
        visible: true
      }
    },
    source: {
      type: 'geojson',
      location: {
        type: 'file',
        file: new File([fixture], fileName, {
          type: 'application/json'
        })
      },
      data: fixture as FeatureCollection,
      sourceData: fixture as FeatureCollection,
      transformations: []
    },
    style: {
      fill: {
        type: 'Constant',
        color: '#000000',
        opacity: 0.5,
        visible: true
      },
      stroke: {
        type: 'Constant',
        color: '#000000',
        width: 1,
        opacity: 0.5,
        visible: true
      }
    }
  };

  test('should build a catalog with minimum and maximum values', async () => {
    const catalog = await buildCatalog(layer.id, layer.source, {
      conn,
      table: tables[layer.id]
    });
    const entries = selectQuantitativeEntries(catalog, layer.id);

    expect(entries.length).toBeGreaterThan(0);
    entries.forEach((entry) => {
      expect(entry.min).toBeDefined();
      expect(entry.max).toBeDefined();
    });
  });

  test('should produce a defined domain on all attributes', async () => {
    const catalog = await buildCatalog(layer.id, layer.source, {
      conn,
      table: tables[layer.id]
    });
    const entries = selectQuantitativeEntries(catalog, layer.id);

    expect(entries.length).toBeGreaterThan(0);
    entries.forEach((entry) => {
      expect(Array.isArray(entry.domain)).toBe(true);
      expect(entry.domain.length).toBeGreaterThan(0);
    });
  });

  test('should produce defined breaks on all attributes', async () => {
    const catalog = await buildCatalog(layer.id, layer.source, {
      conn,
      table: tables[layer.id]
    });
    const entries = selectQuantitativeEntries(catalog, layer.id);

    expect(entries.length).toBeGreaterThan(0);
    entries.forEach((entry) => {
      for (let k = 3; k <= 9; k++) {
        for (const method of ['Quantile', 'Equal Interval', 'Jenks'] as const) {
          const breaks = entry[method][k as QuantitativeStepCount].breaks;
          expect(breaks).toHaveLength(k - 1);
        }
      }
    });
  });
});
