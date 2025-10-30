import type { FeatureCollection } from 'geojson';
import { get } from 'lodash-es';
import { expect, test, describe } from 'vitest';

import type { CartoKitLayer } from '$lib/types';
import { buildCatalog } from '$lib/utils/catalog';
import { isPropertyQuantitative } from '$lib/utils/property';

import usCountiesUnemployment1 from '../../../tests/data/all/us-counties-unemployment.json';

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
        opacity: 0.5
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
});
