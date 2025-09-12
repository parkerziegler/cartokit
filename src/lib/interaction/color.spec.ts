import { expect, test, describe } from 'vitest';
import * as d3 from 'd3';

import { deriveColorScale } from '$lib/interaction/color';
import { DEFAULT_FILL } from '$lib/utils/constants';

describe('deriveColorScale', () => {
  test('should derive a categorical color scale with fewer categories than colors in the scheme', () => {
    const result = deriveColorScale({
      type: 'Categorical',
      attribute: 'primary_source',
      categories: [
        'oil',
        'hydroelectric',
        'natural gas',
        'nuclear',
        'coal',
        'other',
        'wind',
        'solar'
      ],
      scheme: {
        id: 'schemeCategory10',
        direction: 'Forward'
      },
      opacity: 1
    });

    expect(result).toEqual([
      'match',
      ['get', 'primary_source'],
      'oil',
      d3.schemeCategory10[0],
      'hydroelectric',
      d3.schemeCategory10[1],
      'natural gas',
      d3.schemeCategory10[2],
      'nuclear',
      d3.schemeCategory10[3],
      'coal',
      d3.schemeCategory10[4],
      'other',
      d3.schemeCategory10[5],
      'wind',
      d3.schemeCategory10[6],
      'solar',
      d3.schemeCategory10[7],
      DEFAULT_FILL
    ]);
  });
});
