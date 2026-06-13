import type { CartoKitSource, QuantitativeColorScale } from '$lib/types';

export const CLASSIFICATION_METHODS: QuantitativeColorScale['type'][] = [
  'Continuous',
  'Quantile',
  'Equal Interval',
  'Jenks',
  'Manual'
];

export const SOURCE_TYPES_TO_CLASSIFICATION_METHODS: Map<
  CartoKitSource['type'],
  QuantitativeColorScale['type'][]
> = new Map([
  ['geojson', ['Continuous', 'Quantile', 'Equal Interval', 'Jenks', 'Manual']],
  ['vector', ['Continuous', 'Equal Interval', 'Manual']]
]);
