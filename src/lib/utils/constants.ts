import type { CartoKitSource } from '#lib/types/source.ts';

// Default values for layer styles.
export const DEFAULT_FILL = '#000000';
export const DEFAULT_OPACITY = 0.75;
export const DEFAULT_STROKE = '#000000';
export const DEFAULT_STROKE_WIDTH = 1;
export const DEFAULT_STROKE_OPACITY = 1;
export const DEFAULT_METHOD = (sourceType: CartoKitSource['type']) => {
  switch (sourceType) {
    case 'geojson':
    case 'geoparquet':
    case 'table':
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
export const DEFAULT_SIZE = 4;
export const DEFAULT_HEATMAP_RADIUS = 10;
export const DEFAULT_HEATMAP_INTENSITY = 1;
export const DEFAULT_HEATMAP_WEIGHT = 1;

// Default values for UI state.
export const DEFAULT_SELECTION_COLOR = '#a534ff';
export const DEFAULT_HOVER_COLOR = '#ffffff';
