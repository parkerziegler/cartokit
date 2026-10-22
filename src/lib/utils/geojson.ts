import type { FeatureCollection, Geometry } from 'geojson';

/**
 * Get the {@link Geometry['type']} of a {@link FeatureCollection}.
 *
 * @param featureCollection The {@link FeatureCollection} to inspect.
 * @returns The {@link Geometry['type']} type of the {@link FeatureCollection}.
 */
export function getFeatureCollectionGeometryType(
  featureCollection: FeatureCollection
): Geometry['type'] {
  return (
    featureCollection.features?.[0]?.geometry?.type ?? 'GeometryCollection'
  );
}
