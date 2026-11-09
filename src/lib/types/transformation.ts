export interface BufferTransformation {
  type: 'Buffer';
  params: {
    distance: number;
  };
}

interface CentroidTransformation {
  type: 'Centroid';
  params: Record<string, never>;
}

interface EnvelopeTransformation {
  type: 'Envelope';
  params: Record<string, never>;
}

export type Transformation =
  BufferTransformation | CentroidTransformation | EnvelopeTransformation;

export type TransformationsByType = {
  [T in Transformation as T['type']]: T;
};
