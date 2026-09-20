import type { FeatureCollection, Point, Polygon } from 'geojson';
import { expect, test, describe } from 'vitest';

import type { TransformationCall } from '$lib/types/transformation';
import {
  replayTransformations,
  upsertUserTransformation
} from '$lib/utils/transformation';

function createUserTransformation(
  overrides: Partial<TransformationCall> = {}
): TransformationCall {
  return {
    name: 'transformGeojson',
    params: ['geojson'],
    paramTypes: ['any'],
    returnType: 'any',
    definitionTS: '{ return geojson; }',
    definitionJS: '{ return geojson; }',
    kind: 'user',
    args: [],
    ...overrides
  };
}

const generateDotDensityPoints: TransformationCall = {
  name: 'generateDotDensityPoints',
  params: ['geojson', 'attribute', 'dotValue'],
  paramTypes: ['FeatureCollection', 'string', 'number'],
  returnType: 'FeatureCollection',
  definitionTS: '',
  definitionJS: '',
  kind: 'geometric',
  args: ['population', 100]
};

describe('upsertUserTransformation', () => {
  test('appends when the layer has no user transformation', () => {
    const transformation = createUserTransformation();

    expect(
      upsertUserTransformation([generateDotDensityPoints], transformation)
    ).toEqual([generateDotDensityPoints, transformation]);
  });

  test('replaces an existing user transformation at its index', () => {
    const existing = createUserTransformation();
    const renamed = createUserTransformation({
      name: 'addPopulationDensity',
      definitionJS: '{ return geojson; }'
    });

    expect(
      upsertUserTransformation([existing, generateDotDensityPoints], renamed)
    ).toEqual([renamed, generateDotDensityPoints]);
  });

  test('leaves geometric transformations untouched', () => {
    const transformation = createUserTransformation();
    const transformations = [generateDotDensityPoints];

    upsertUserTransformation(transformations, transformation);

    expect(
      upsertUserTransformation(transformations, transformation)[0]
    ).toEqual(generateDotDensityPoints);
  });
});

describe('replayTransformations', () => {
  const sourceData: FeatureCollection<Polygon> = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { population: 200 },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [0, 1],
              [1, 1],
              [1, 0],
              [0, 0]
            ]
          ]
        }
      }
    ]
  };

  test('returns the source data when there are no transformations', () => {
    expect(replayTransformations(sourceData, [])).toEqual(sourceData);
  });

  test('applies a user transformation exactly once', () => {
    const increment = createUserTransformation({
      definitionJS: `{
        return {
          ...geojson,
          features: geojson.features.map((feature) => ({
            ...feature,
            properties: { ...feature.properties, population: feature.properties.population + 1 }
          }))
        };
      }`
    });

    const output = replayTransformations(sourceData, [increment]);

    expect(output.features[0].properties?.population).toBe(201);
  });

  test('feeds user output into a downstream geometric transformation', () => {
    const halve = createUserTransformation({
      definitionJS: `{
        return {
          ...geojson,
          features: geojson.features.map((feature) => ({
            ...feature,
            properties: { ...feature.properties, population: feature.properties.population / 2 }
          }))
        };
      }`
    });

    const output = replayTransformations(sourceData, [
      halve,
      generateDotDensityPoints
    ]) as FeatureCollection<Point>;

    // 100 people halved, at a dot value of 100, yields a single dot carrying
    // the transformed attribute.
    expect(output.features).toHaveLength(1);
    expect(output.features[0].geometry.type).toBe('Point');
    expect(output.features[0].properties?.population).toBe(100);
  });

  test('throws on an unknown geometric transformation', () => {
    expect(() =>
      replayTransformations(sourceData, [
        { ...generateDotDensityPoints, name: 'unknownTransformation' }
      ])
    ).toThrow(/unknownTransformation/);
  });
});
