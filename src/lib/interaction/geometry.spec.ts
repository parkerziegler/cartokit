import { expect, test, describe } from 'vitest';

import { deriveSize } from '$lib/interaction/geometry';
import { catalog } from '$lib/state/catalog.svelte';
import type { NumericCatalogEntry, ProportionalSymbolStyle } from '$lib/types';
import { signedSqrt } from '$lib/utils/number';

const LAYER_ID = 'test-layer';

function buildStyle(attribute: string): ProportionalSymbolStyle {
  return {
    attribute,
    min: 2,
    max: 20
  };
}

function setCatalogEntry(
  layerId: string,
  attribute: string,
  min: number,
  max: number
): void {
  const entry: NumericCatalogEntry = {
    type: 'number',
    quantiles: { domain: [] },
    jenks: {
      3: { breaks: [] },
      4: { breaks: [] },
      5: { breaks: [] },
      6: { breaks: [] },
      7: { breaks: [] },
      8: { breaks: [] },
      9: { breaks: [] }
    },
    min,
    max,
    unique: 2
  };

  catalog.value[layerId] = { [attribute]: entry };
}

describe('deriveSize', () => {
  test('derives a square root scale when the attribute range is fully positive', () => {
    const style = buildStyle('population');
    setCatalogEntry(LAYER_ID, 'population', 10, 1000);

    const result = deriveSize(LAYER_ID, style);

    expect(result).toEqual([
      'interpolate',
      ['linear'],
      ['sqrt', ['get', 'population']],
      signedSqrt(10),
      2,
      signedSqrt(1000),
      20
    ]);
  });

  test('derives a signed square root scale when the attribute range crosses zero', () => {
    const style = buildStyle('net_change');
    setCatalogEntry(LAYER_ID, 'net_change', -50, 100);

    const result = deriveSize(LAYER_ID, style);

    expect(result).toEqual([
      'interpolate',
      ['linear'],
      [
        '*',
        ['case', ['<', ['get', 'net_change'], 0], -1, 1],
        ['sqrt', ['abs', ['get', 'net_change']]]
      ],
      signedSqrt(-50),
      2,
      signedSqrt(100),
      20
    ]);
  });

  test('derives a signed square root scale when the attribute range is fully negative', () => {
    const style = buildStyle('temperature_deviation');
    setCatalogEntry(LAYER_ID, 'temperature_deviation', -100, -10);

    const result = deriveSize(LAYER_ID, style);

    expect(result).toEqual([
      'interpolate',
      ['linear'],
      [
        '*',
        ['case', ['<', ['get', 'temperature_deviation'], 0], -1, 1],
        ['sqrt', ['abs', ['get', 'temperature_deviation']]]
      ],
      signedSqrt(-100),
      2,
      signedSqrt(-10),
      20
    ]);
  });
});
