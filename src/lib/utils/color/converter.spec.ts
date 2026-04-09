import { expect, test, describe } from 'vitest';

import {
  convertSchemeToRamp,
  convertRampToScheme
} from '$lib/utils/color/converter';
import { DEFAULT_QUANTITATIVE_SCHEME } from '$lib/utils/constants';

describe('convertSchemeToRamp', () => {
  test('converts a valid sequential single-hue scheme to its ramp', () => {
    expect(convertSchemeToRamp('schemeBlues')).toBe('interpolateBlues');
  });

  test('converts a valid sequential multi-hue scheme to its ramp', () => {
    expect(convertSchemeToRamp('schemeBuGn')).toBe('interpolateBuGn');
  });

  test('converts a valid diverging scheme to its ramp', () => {
    expect(convertSchemeToRamp('schemeSpectral')).toBe('interpolateSpectral');
  });
});

describe('convertRampToScheme', () => {
  test('converts a valid sequential single-hue ramp to its scheme', () => {
    expect(convertRampToScheme('interpolateBlues')).toBe('schemeBlues');
  });

  test('converts a valid sequential multi-hue ramp to its scheme', () => {
    expect(convertRampToScheme('interpolateBuGn')).toBe('schemeBuGn');
  });

  test('converts a valid diverging ramp to its scheme', () => {
    expect(convertRampToScheme('interpolateSpectral')).toBe('schemeSpectral');
  });

  test('returns DEFAULT_QUANTITATIVE_SCHEME when the ramp has no corresponding scheme', () => {
    // 'interpolateViridis' -> 'schemeViridis', which is not a valid scheme.
    expect(convertRampToScheme('interpolateViridis')).toBe(
      DEFAULT_QUANTITATIVE_SCHEME
    );
  });

  test('returns DEFAULT_QUANTITATIVE_SCHEME when the ramp has no corresponding scheme (cyclical)', () => {
    // 'interpolateRainbow' -> 'schemeRainbow', which is not a valid scheme.
    expect(convertRampToScheme('interpolateRainbow')).toBe(
      DEFAULT_QUANTITATIVE_SCHEME
    );
  });
});
