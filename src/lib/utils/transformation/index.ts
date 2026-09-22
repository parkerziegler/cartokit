import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';

import { deriveCentroids } from '$lib/stdlib/centroid';
import { generateDotDensityPoints } from '$lib/stdlib/dot-density';
import type { TransformationCall } from '$lib/types/transformation';

/**
 * Execute a user-defined transformation against a {@link FeatureCollection}.
 *
 * @param program The source code of the user-defined transformation function.
 * @param featureCollection The {@link FeatureCollection} to transform.
 * @param onconsole A callback invoked with the accumulated arguments of every
 * console.log call made by the program so far, in call order.
 * @returns The transformed {@link FeatureCollection}.
 */
export function runTransformation(
  program: string,
  featureCollection: FeatureCollection,
  onconsole?: (args: unknown[]) => void
): FeatureCollection {
  const log = console.log.bind(console);
  const output: unknown[] = [];

  if (onconsole) {
    console.log = (...args: unknown[]) => {
      output.push(...args);
      onconsole(output);
      log(...args);
    };
  }

  try {
    const transformGeojson = new Function(`return (${program});`)() as (
      featureCollection: FeatureCollection
    ) => FeatureCollection;

    return transformGeojson(featureCollection);
  } finally {
    console.log = log;
  }
}

/**
 * Place a user-defined transformation into a layer's transformations, preserv-
 * ing its position relative to geometric transformations. A layer holds at most
 * one user-defined transformation, so an existing one is replaced regardless of
 * its name.
 *
 * @param transformations The layer's current {@link TransformationCall}s.
 * @param transformation The user-defined {@link TransformationCall} to place.
 * @returns The layer's updated {@link TransformationCall}s.
 */
export function upsertUserTransformation(
  transformations: TransformationCall[],
  transformation: TransformationCall
): TransformationCall[] {
  const tIdx = transformations.findIndex(({ kind }) => kind === 'user');

  return tIdx > -1
    ? transformations.toSpliced(tIdx, 1, transformation)
    : [...transformations, transformation];
}

/**
 * Insert a geometric transformation, replacing any existing transformation of
 * the same name.
 *
 * @param transformations The layer's current {@link TransformationCall}s.
 * @param transformation The user-defined {@link TransformationCall} to place.
 * @returns The layer's updated {@link TransformationCall}s.
 */
export function upsertGeometricTransformation(
  transformations: TransformationCall[],
  transformation: TransformationCall
): TransformationCall[] {
  const tIdx = transformations.findIndex((t) => t.name === transformation.name);

  return tIdx > -1
    ? transformations.toSpliced(tIdx, 1, transformation)
    : [...transformations, transformation];
}

/**
 * Execute a layer's transformations, in order, against its source
 * {@link FeatureCollection} to derive its current {@link FeatureCollection}.
 *
 * @param sourceData The {@link FeatureCollection} at the time of layer creation.
 * @param transformations The {@link TransformationCall}s to execute.
 * @returns The transformed {@link FeatureCollection}.
 */
export function replayTransformations(
  sourceData: FeatureCollection,
  transformations: TransformationCall[]
): FeatureCollection {
  return transformations.reduce((data, transformation) => {
    const { name, params, definitionJS, kind, args } = transformation;

    if (kind === 'user') {
      return runTransformation(
        `function ${name}(${params.join(', ')}) ${definitionJS}`,
        data
      );
    }

    switch (name) {
      case 'deriveCentroids':
        return deriveCentroids(data);
      case 'generateDotDensityPoints':
        return generateDotDensityPoints(
          data as FeatureCollection<Polygon | MultiPolygon>,
          args[0] as string,
          args[1] as number
        );
      default:
        throw new Error(`Unknown geometric transformation: ${name}.`);
    }
  }, sourceData);
}
