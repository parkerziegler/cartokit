import { deriveThresholds } from '$lib/interaction/scales';
import { materializeColorScheme } from '$lib/utils/color/scheme';

// CartoKit default values.
export const DEFAULT_FILL = '#000000';
export const DEFAULT_OPACITY = 0.75;
export const DEFAULT_STROKE = '#000000';
export const DEFAULT_STROKE_WIDTH = 1;
export const DEFAULT_STROKE_OPACITY = 1;
export const DEFAULT_METHOD = 'Quantile';
export const DEFAULT_QUANTITATIVE_SCHEME = 'schemeOranges';
export const DEFAULT_CATEGORICAL_SCHEME = 'schemeCategory10';
export const DEFAULT_RAMP = 'Spectral';
export const DEFAULT_SCHEME_DIRECTION = 'Forward';
export const DEFAULT_COUNT = 5;
export const DEFAULT_THRESHOLDS = (layerId: string, attribute: string) =>
  deriveThresholds({
    method: DEFAULT_METHOD,
    layerId,
    attribute,
    range: materializeColorScheme(
      DEFAULT_QUANTITATIVE_SCHEME,
      DEFAULT_SCHEME_DIRECTION,
      DEFAULT_COUNT
    ),
    thresholds: []
  });
export const DEFAULT_MIN_SIZE = 1;
export const DEFAULT_MAX_SIZE = 25;
export const DEFAULT_RADIUS = 3;
export const DEFAULT_HEATMAP_RADIUS = 10;
export const DEFAULT_HEATMAP_INTENSITY = 1;
export const DEFAULT_HEATMAP_WEIGHT = 1;
