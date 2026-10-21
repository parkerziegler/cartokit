import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

import type { FeatureCollection } from 'geojson';
import { expect, test, describe } from 'vitest';

import type { CartoKitLayer } from '$lib/types';
import type { Catalog, NumericAttributeEntry } from '$lib/types/catalog';
import { buildCatalog } from '$lib/utils/catalog';

const usCountiesUnemployment1 = JSON.parse(
  fs.readFileSync(
    path.join(
      __dirname,
      '../../../tests/data/all/us-counties-unemployment.json'
    ),
    'utf8'
  )
);

const americanCrowRange = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../../../tests/data/all/american-crow-range.json'),
    'utf8'
  )
);

describe('buildCatalog', () => {
  const layer: CartoKitLayer = {
    id: 'us-counties-unemployment__1',
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
        file: new File(
          [usCountiesUnemployment1],
          'us-counties-unemployment.json',
          { type: 'application/json' }
        )
      },
      data: usCountiesUnemployment1 as FeatureCollection,
      sourceData: usCountiesUnemployment1 as FeatureCollection,
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

  const singleFeatureLayer: CartoKitLayer = {
    id: 'american-crow-range.json',
    type: 'Polygon',
    displayName: 'American Crow Range',
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
        file: new File([americanCrowRange], 'american-crow-range.json', {
          type: 'application/json'
        })
      },
      data: americanCrowRange as FeatureCollection,
      sourceData: americanCrowRange as FeatureCollection,
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

  /**
   * Select the numeric attribute entries for a layer from a built catalog.
   */
  function selectNumericEntries(catalog: Catalog, layerId: string) {
    return Object.values(catalog[layerId].attributes).filter(
      (entry): entry is NumericAttributeEntry => entry.type === 'number'
    );
  }

  test('should build a catalog with minimum and maximum values', async () => {
    const catalog = await buildCatalog(layer.id, layer.source);
    const entries = selectNumericEntries(catalog, layer.id);

    expect(entries.length).toBeGreaterThan(0);
    entries.forEach((entry) => {
      expect(entry.min).toBeDefined();
      expect(entry.max).toBeDefined();
    });
  });

  test('should produce a defined domain for quantiles on all attributes', async () => {
    const catalog = await buildCatalog(layer.id, layer.source);
    const entries = selectNumericEntries(catalog, layer.id);

    expect(entries.length).toBeGreaterThan(0);
    entries.forEach((entry) => {
      expect(Array.isArray(entry.quantiles.domain)).toBe(true);
      expect(entry.quantiles.domain.length).toBeGreaterThan(0);
    });
  });

  test('should produce defined breaks for Jenks natural breaks on all attributes', async () => {
    const catalog = await buildCatalog(layer.id, layer.source);
    const entries = selectNumericEntries(catalog, layer.id);

    expect(entries.length).toBeGreaterThan(0);
    entries.forEach((entry) => {
      // Test each possible k value that buildCatalog tries (3 through 9)
      for (let k = 3; k <= 9; k++) {
        const breaks =
          entry.jenks[k as keyof NumericAttributeEntry['jenks']].breaks;
        expect(breaks).toHaveLength(k - 1);
      }
    });
  });

  test('should not produce Jenks natural breaks if the number of data values in the domain is less than the number of breaks', async () => {
    const catalog = await buildCatalog(
      singleFeatureLayer.id,
      singleFeatureLayer.source
    );
    const entries = selectNumericEntries(catalog, singleFeatureLayer.id);

    expect(entries.length).toBeGreaterThan(0);
    entries.forEach((entry) => {
      // Test each possible k value that buildCatalog tries (3 through 9)
      for (let k = 3; k <= 9; k++) {
        expect(
          entry.jenks?.[k as keyof NumericAttributeEntry['jenks']]
        ).toBeUndefined();
      }
    });
  });
});
