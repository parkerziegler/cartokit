import { expect, test, describe } from 'vitest';
import * as d3 from 'd3';

import { deriveColorRamp, deriveColorScale } from '$lib/interaction/color';
import { DEFAULT_FILL } from '$lib/utils/constants';

describe('deriveColorScale', () => {
  describe('Quantitative', () => {
    const STOPS = 7;

    test('should derive a quantitative color scale', () => {
      const result = deriveColorScale({
        type: 'Quantitative',
        attribute: 'total_capacity',
        scheme: {
          id: 'schemeBlues',
          direction: 'Forward'
        },
        method: 'Quantile',
        count: STOPS,
        thresholds: [1.6, 2.8, 5, 10.8, 42, 151.63],
        opacity: 1,
        visible: true
      });

      expect(result).toEqual([
        'step',
        ['get', 'total_capacity'],
        d3.schemeBlues[STOPS][0],
        1.6,
        d3.schemeBlues[STOPS][1],
        2.8,
        d3.schemeBlues[STOPS][2],
        5,
        d3.schemeBlues[STOPS][3],
        10.8,
        d3.schemeBlues[STOPS][4],
        42,
        d3.schemeBlues[STOPS][5],
        151.63,
        d3.schemeBlues[STOPS][6]
      ]);
    });

    test('should derive a quantitative color scale with a reverse direction', () => {
      const result = deriveColorScale({
        type: 'Quantitative',
        attribute: 'total_capacity',
        scheme: {
          id: 'schemeBlues',
          direction: 'Reverse'
        },
        method: 'Quantile',
        count: STOPS,
        thresholds: [1.6, 2.8, 5, 10.8, 42, 151.63],
        opacity: 1,
        visible: true
      });

      expect(result).toEqual([
        'step',
        ['get', 'total_capacity'],
        d3.schemeBlues[STOPS][6],
        1.6,
        d3.schemeBlues[STOPS][5],
        2.8,
        d3.schemeBlues[STOPS][4],
        5,
        d3.schemeBlues[STOPS][3],
        10.8,
        d3.schemeBlues[STOPS][2],
        42,
        d3.schemeBlues[STOPS][1],
        151.63,
        d3.schemeBlues[STOPS][0]
      ]);
    });
  });

  describe('Categorical', () => {
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
        opacity: 1,
        visible: true
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

    test('should derive a categorical color scale with more categories than colors in the scheme, applying the DEFAULT_FILL to unmatched categories', () => {
      const result = deriveColorScale({
        type: 'Categorical',
        attribute: 'county',
        categories: [
          'Aleutians East',
          'Tuscaloosa',
          'Mobile',
          'Elmore',
          'Etowah',
          'El Paso',
          'Greene',
          'Calhoun',
          'Talladega',
          'Chilton',
          'Coosa',
          'Walker',
          'Cherokee',
          'Shelby',
          'Watonwan'
        ],
        scheme: {
          id: 'schemeCategory10',
          direction: 'Forward'
        },
        opacity: 1,
        visible: true
      });

      expect(result).toEqual([
        'match',
        ['get', 'county'],
        'Aleutians East',
        d3.schemeCategory10[0],
        'Tuscaloosa',
        d3.schemeCategory10[1],
        'Mobile',
        d3.schemeCategory10[2],
        'Elmore',
        d3.schemeCategory10[3],
        'Etowah',
        d3.schemeCategory10[4],
        'El Paso',
        d3.schemeCategory10[5],
        'Greene',
        d3.schemeCategory10[6],
        'Calhoun',
        d3.schemeCategory10[7],
        'Talladega',
        d3.schemeCategory10[8],
        'Chilton',
        d3.schemeCategory10[9],
        DEFAULT_FILL
      ]);
    });

    test('should derive a categorical color scale with a reverse direction', () => {
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
          direction: 'Reverse'
        },
        opacity: 1,
        visible: true
      });

      expect(result).toEqual([
        'match',
        ['get', 'primary_source'],
        'oil',
        d3.schemeCategory10[9],
        'hydroelectric',
        d3.schemeCategory10[8],
        'natural gas',
        d3.schemeCategory10[7],
        'nuclear',
        d3.schemeCategory10[6],
        'coal',
        d3.schemeCategory10[5],
        'other',
        d3.schemeCategory10[4],
        'wind',
        d3.schemeCategory10[3],
        'solar',
        d3.schemeCategory10[2],
        DEFAULT_FILL
      ]);
    });
  });

  describe('Constant', () => {
    test('should derive a constant color scale', () => {
      const result = deriveColorScale({
        type: 'Constant',
        color: '#c6abdd',
        opacity: 1,
        visible: true
      });

      expect(result).toEqual('#c6abdd');
    });
  });
});

describe('deriveColorRamp', () => {
  test('should derive a color ramp', () => {
    const result = deriveColorRamp({
      weight: {
        type: 'Constant',
        value: 1
      },
      ramp: {
        id: 'Spectral',
        direction: 'Forward'
      },
      radius: 10,
      intensity: 1,
      opacity: 1,
      visible: true
    });

    const start = d3.color(d3.interpolateSpectral(0));
    start!.opacity = 0;

    expect(result).toEqual([
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0,
      start!.formatRgb(),
      0.1,
      d3.rgb(d3.interpolateSpectral(0.1)).formatHex(),
      0.2,
      d3.rgb(d3.interpolateSpectral(0.2)).formatHex(),
      0.3,
      d3.rgb(d3.interpolateSpectral(0.3)).formatHex(),
      0.4,
      d3.rgb(d3.interpolateSpectral(0.4)).formatHex(),
      0.5,
      d3.rgb(d3.interpolateSpectral(0.5)).formatHex(),
      0.6,
      d3.rgb(d3.interpolateSpectral(0.6)).formatHex(),
      0.7,
      d3.rgb(d3.interpolateSpectral(0.7)).formatHex(),
      0.8,
      d3.rgb(d3.interpolateSpectral(0.8)).formatHex(),
      0.9,
      d3.rgb(d3.interpolateSpectral(0.9)).formatHex(),
      1,
      d3.rgb(d3.interpolateSpectral(1)).formatHex()
    ]);
  });

  test('should derive a color ramp with a reverse direction', () => {
    const result = deriveColorRamp({
      weight: {
        type: 'Constant',
        value: 1
      },
      ramp: {
        id: 'Spectral',
        direction: 'Reverse'
      },
      radius: 10,
      intensity: 1,
      opacity: 1,
      visible: true
    });

    const start = d3.color(d3.interpolateSpectral(1));
    start!.opacity = 0;

    expect(result).toEqual([
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0,
      start!.formatRgb(),
      0.1,
      d3.rgb(d3.interpolateSpectral(0.9)).formatHex(),
      0.2,
      d3.rgb(d3.interpolateSpectral(0.8)).formatHex(),
      0.3,
      d3.rgb(d3.interpolateSpectral(0.7)).formatHex(),
      0.4,
      d3.rgb(d3.interpolateSpectral(0.6)).formatHex(),
      0.5,
      d3.rgb(d3.interpolateSpectral(0.5)).formatHex(),
      0.6,
      d3.rgb(d3.interpolateSpectral(0.4)).formatHex(),
      0.7,
      d3.rgb(d3.interpolateSpectral(0.3)).formatHex(),
      0.8,
      d3.rgb(d3.interpolateSpectral(0.2)).formatHex(),
      0.9,
      d3.rgb(d3.interpolateSpectral(0.1)).formatHex(),
      1,
      d3.rgb(d3.interpolateSpectral(0)).formatHex()
    ]);
  });
});
