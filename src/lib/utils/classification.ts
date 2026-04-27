import type { QuantitativeColorScale } from '$lib/types';

export const CLASSIFICATION_METHODS: QuantitativeColorScale['type'][] = [
  'Continuous',
  'Quantile',
  'Equal Interval',
  'Jenks',
  'Manual'
];
