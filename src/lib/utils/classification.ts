import type { QuantitativeColorScale } from '$lib/types';
import type { CartoKitSource } from '$lib/types/source';

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
  [
    'geoparquet',
    ['Continuous', 'Quantile', 'Equal Interval', 'Jenks', 'Manual']
  ],
  ['pmtiles', ['Continuous', 'Equal Interval', 'Manual']],
  ['table', ['Continuous', 'Quantile', 'Equal Interval', 'Jenks', 'Manual']]
]);
