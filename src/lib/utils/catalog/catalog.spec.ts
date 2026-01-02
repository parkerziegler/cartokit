import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

import type { FeatureCollection } from 'geojson';
import { get } from 'lodash-es';
import { expect, test, describe } from 'vitest';

import type { CartoKitLayer } from '$lib/types';
import { buildCatalog } from '$lib/utils/catalog';
import { isPropertyQuantitative } from '$lib/utils/property';

const usCountiesUnemployment1 = JSON.parse(
  fs.readFileSync(
    path.join(
      __dirname,
      '../../../../tests/data/all/us-counties-unemployment.json'
    ),
    'utf8'
  )
);

const americanCrowRange = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../../../../tests/data/all/american-crow-range.json'),
    'utf8'
  )
);

describe('buildCatalog', () => {
  const layer: CartoKitLayer = {
    id: 'us-counties-unemployment__1',
    type: 'Polygon',
    displayName: 'US Counties Unemployment',
    layout: {
      visibility: 'visible',
      z: 0,
      tooltip: {
        visible: true
      }
    },
    data: {
      geojson: usCountiesUnemployment1 as FeatureCollection,
      sourceGeojson: usCountiesUnemployment1 as FeatureCollection,
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
      visibility: 'visible',
      z: 0,
      tooltip: {
        visible: true
      }
    },
    data: {
      geojson: americanCrowRange as FeatureCollection,
      sourceGeojson: americanCrowRange as FeatureCollection,
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

  test('should build a catalog with minimum and maximum values', () => {
    const catalog = buildCatalog(layer);

    const attrributes = Object.keys(
      layer.data.geojson.features[0].properties || {}
    ).filter(isPropertyQuantitative);

    attrributes.forEach((attribute) => {
      expect(get(catalog, `${layer.id}.${attribute}.min`)).toBeDefined();
      expect(get(catalog, `${layer.id}.${attribute}.max`)).toBeDefined();
    });
  });

  test('should produce defined breaks for quantiles on all attributes', () => {
    const catalog = buildCatalog(layer);

    const attributes = Object.keys(
      layer.data.geojson.features[0].properties || {}
    ).filter(isPropertyQuantitative);

    attributes.forEach((attribute) => {
      const domain = get(catalog, `${layer.id}.${attribute}.Quantile.domain`);
      expect(domain).toBeDefined();
      expect(Array.isArray(domain)).toBe(true);
      expect(domain.length).toBeGreaterThan(0);
    });
  });

  test('should produce defined breaks for equal intervals on all attributes', () => {
    const catalog = buildCatalog(layer);

    const attributes = Object.keys(
      layer.data.geojson.features[0].properties || {}
    ).filter(isPropertyQuantitative);

    attributes.forEach((attribute) => {
      const domain = get(
        catalog,
        `${layer.id}.${attribute}.EqualInterval.domain`
      );
      expect(domain).toBeDefined();
      expect(Array.isArray(domain)).toBe(true);
      expect(domain.length).toBeGreaterThan(0);
    });
  });

  test('should produce defined breaks for Jenks natural breaks on all attributes', () => {
    const catalog = buildCatalog(layer);

    const attributes = Object.keys(
      layer.data.geojson.features[0].properties || {}
    ).filter(isPropertyQuantitative);

    attributes.forEach((attribute) => {
      const domain = get(catalog, `${layer.id}.${attribute}.Jenks.domain`);
      expect(domain).toBeDefined();
      expect(Array.isArray(domain)).toBe(true);
      expect(domain.length).toBeGreaterThan(0);
    });
  });

  test('should not produce Jenks natural breaks if the number of data values in the domain is less than the number of breaks', () => {
    const catalog = buildCatalog(singleFeatureLayer);
    const attributes = Object.keys(
      singleFeatureLayer.data.geojson.features[0].properties || {}
    ).filter(isPropertyQuantitative);

    attributes.forEach((attribute) => {
      // Test each possible k value that buildCatalog tries (3 through 9)
      for (let k = 3; k <= 9; k++) {
        const breaks = get(
          catalog,
          `${singleFeatureLayer.id}.${attribute}.Jenks.${k}.breaks`
        );
        expect(breaks).toBeUndefined();
      }
    });
  });
});
