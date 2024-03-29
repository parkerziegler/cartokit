import * as d3 from 'd3';
import type { Feature } from 'geojson';

import { deriveQuantiles } from '$lib/interaction/scales';

// CartoKit default values.
export const DEFAULT_MAP_TYPE = 'Fill';
export const DEFAULT_FILL = '#FFFFFF';
export const DEFAULT_OPACITY = 0.75;
export const DEFAULT_STROKE = '#000000';
export const DEFAULT_STROKE_WIDTH = 1;
export const DEFAULT_STROKE_OPACITY = 1;
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
export const DEFAULT_RADIUS = 2;

// Mapbox default values. Used during codegen to avoid adding stylistic
// properties that match Mapbox defaults.
export const MAPBOX_DEFAULTS = {
  'circle-radius': 5,
  'fill-color': '#000000',
  'line-color': '#000000',
  'fill-opacity': 1,
  'line-opacity': 1,
  'line-width': 1,
  'circle-color': '#000000',
  'circle-opacity': 1,
  'circle-stroke-color': '#000000',
  'circle-stroke-width': 0,
  'circle-stroke-opacity': 1
};
