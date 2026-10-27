import type { CartoKitSource } from '$lib/types';

// CartoKit default values.
export const DEFAULT_FILL = '#000000';
export const DEFAULT_OPACITY = 0.75;
export const DEFAULT_STROKE = '#000000';
export const DEFAULT_STROKE_WIDTH = 1;
export const DEFAULT_STROKE_OPACITY = 1;
export const DEFAULT_METHOD = (sourceType: CartoKitSource['type']) => {
  switch (sourceType) {
    case 'geojson':
    case 'geoparquet':
      return 'Quantile';
    case 'pmtiles':
      return 'Equal Interval';
  }
};
export const DEFAULT_QUANTITATIVE_SCHEME = 'schemeOranges';
export const DEFAULT_CATEGORICAL_SCHEME = 'schemeCategory10';
export const DEFAULT_RAMP = 'interpolateSpectral';
export const DEFAULT_SCHEME_DIRECTION = 'Forward';
export const DEFAULT_COUNT = 5;
export const DEFAULT_MIN_SIZE = 1;
export const DEFAULT_MAX_SIZE = 25;
export const DEFAULT_SIZE = 3;
export const DEFAULT_HEATMAP_RADIUS = 10;
export const DEFAULT_HEATMAP_INTENSITY = 1;
export const DEFAULT_HEATMAP_WEIGHT = 1;
