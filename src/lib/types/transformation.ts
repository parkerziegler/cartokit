/**
 * Represents the kind of transformation.
 */
export type TransformationKind = 'geometric' | 'user';

/**
 * Represents a transformation applied to a layer.
 */
interface BaseTransformation {
  /** The function name of the transformation. */
  name: string;
  /** The function parameters of the transformation. */
  params: string[];
  /** The types of the function parameters of the transformation. */
  paramTypes: string[];
  /** The type of the function return value of the transformation. */
  returnType: string;
  /** The TypeScript function body of the transformation. */
  definitionTS: string;
  /** The JavaScript function body of the transformation. */
  definitionJS: string;
}

/**
 * Represents a {@link BaseTransformation} modifying the geometry of a layer.
 */
export interface GeometricTransformation extends BaseTransformation {
  /** The kind of the transformation, used for type discrimination. */
  kind: 'geometric';
}

/**
 * Represents a {@link BaseTransformation} defined by a user.
 */
export interface UserTransformation extends BaseTransformation {
  /** The kind of the transformation, used for type discrimination. */
  kind: 'user';
}

/**
 * Represents the definition of a transformation on GeoJSON data.
 */
export type Transformation = GeometricTransformation | UserTransformation;

/**
 * Represents a concrete call of a {@link GeometricTransformation}.
 */
export interface GeometricTransformationCall extends BaseTransformation {
  /** The kind of the transformation, used for type discrimination. */
  kind: 'geometric';
  /** Argument values passed to the transformation. */
  args: (string | number)[];
}

/**
 * Represents a concrete call of a {@link UserTransformation}.
 */
export interface UserTransformationCall extends BaseTransformation {
  /** The kind of the transformation, used for type discrimination. */
  kind: 'user';
  /** Argument values passed to the transformation. */
  args: (string | number)[];
}

/**
 * Represents a concrete call of a {@link Transformation}.
 */
export type TransformationCall =
  GeometricTransformationCall | UserTransformationCall;
