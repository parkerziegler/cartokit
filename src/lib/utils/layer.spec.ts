import { expect, test, describe } from 'vitest';

import { isAffiliatedId, isAffiliatedLayer } from '$lib/utils/layer';

const LAYER_ID = 'power-plants__1';

describe('isAffiliatedId', () => {
  test('matches the layer itself', () => {
    expect(isAffiliatedId(LAYER_ID, LAYER_ID)).toBe(true);
  });

  test('matches the instrumentation layers cartokit draws for a layer', () => {
    const ids = [
      `${LAYER_ID}-stroke`,
      `${LAYER_ID}-hover`,
      `${LAYER_ID}-select`,
      `${LAYER_ID}-points`,
      `${LAYER_ID}-outlines`,
      `${LAYER_ID}-outlines-hover`,
      `${LAYER_ID}-outlines-select`
    ];

    for (const id of ids) {
      expect(isAffiliatedId(LAYER_ID, id)).toBe(true);
    }
  });

  test('does not match a sibling layer sharing the id as a prefix', () => {
    expect(isAffiliatedId(LAYER_ID, 'power-plants__12')).toBe(false);
    expect(isAffiliatedId(LAYER_ID, 'power-plants__12-stroke')).toBe(false);
  });

  test('does not match an unrelated layer', () => {
    expect(isAffiliatedId(LAYER_ID, 'urban-areas__2')).toBe(false);
  });
});

describe('isAffiliatedLayer', () => {
  test('matches a layer drawn from the source of the layer', () => {
    expect(
      isAffiliatedLayer(LAYER_ID, {
        id: `${LAYER_ID}-points`,
        source: LAYER_ID
      })
    ).toBe(true);
  });

  test('matches a layer drawn from an affiliated source', () => {
    expect(
      isAffiliatedLayer(LAYER_ID, {
        id: `${LAYER_ID}-outlines-hover`,
        source: `${LAYER_ID}-outlines`
      })
    ).toBe(true);
  });

  test('does not match a basemap layer named like an affiliated layer', () => {
    expect(
      isAffiliatedLayer('road', { id: 'road-label', source: 'maptiler_planet' })
    ).toBe(false);
  });

  test('does not match a layer without a source', () => {
    expect(isAffiliatedLayer(LAYER_ID, { id: LAYER_ID })).toBe(false);
  });
});
