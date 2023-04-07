import * as d3 from 'd3';
import type { Feature } from 'geojson';

import { deriveQuantiles } from '$lib/interaction/scales';

export const DEFAULT_OPACITY = 1;
export const DEFAULT_FILL = '#FFFFFF';

export const DEFAULT_SCALE = 'Quantile';
export const DEFAULT_SCHEME = d3.schemeOranges;
export const DEFAULT_COUNT = 5;
export const DEFAULT_THRESHOLDS = (attribute: string, features: Feature[]) =>
  deriveQuantiles({
    attribute,
    features,
    range: [...DEFAULT_SCHEME[DEFAULT_COUNT]]
  });

export const DEFAULT_MIN_SIZE = 1;
export const DEFAULT_MAX_SIZE = 50;
// MapLibre GL JS's default circle radius.
// https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-circle-circle-radius
export const DEFAULT_RADIUS = 5;
