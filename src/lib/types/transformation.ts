import type { CartoKitLayer } from '$lib/types/CartoKitLayer';
import { BUFFER_UNITS } from '$lib/utils/constants';

export interface Transformation {
  name: string;
  definition: string;
  type: 'geometric' | 'statistical';
}

interface BaseUserTransformation {
  id: string;
  layer: CartoKitLayer;
  settings: Record<string, unknown>;
  output: string;
}

export interface BufferTransformation extends BaseUserTransformation {
  type: 'Buffer';
  settings: {
    distance: number;
    units: (typeof BUFFER_UNITS)[number];
  };
}

export type UserTransformation = BufferTransformation;
