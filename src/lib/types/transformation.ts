/**
 * A transformation that buffers each geometry by a fixed distance, via
 * ST_Buffer.
 */
export interface BufferTransformation {
  /** The type of the transformation, 'Buffer'. */
  type: 'Buffer';
  params: {
    /** The buffer distance, in meters. */
    distance: number;
  };
}

/** A transformation that reduces each geometry to its centroid. */
interface CentroidTransformation {
  /** The type of the transformation, 'Centroid'. */
  type: 'Centroid';
  /** Centroid takes no parameters. */
  params: Record<string, never>;
}

/**
 * A transformation that reduces each geometry to its bounding box, via
 * ST_Envelope.
 */
interface EnvelopeTransformation {
  /** The type of the transformation, 'Envelope'. */
  type: 'Envelope';
  /** Envelope takes no parameters. */
  params: Record<string, never>;
}

/** The possible transformations that can be applied to a layer's table. */
export type Transformation =
  BufferTransformation | CentroidTransformation | EnvelopeTransformation;
