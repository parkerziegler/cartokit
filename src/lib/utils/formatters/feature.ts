import * as d3 from 'd3';

import type { CartoKitLayer } from '$lib/types';
import { pluralize } from '$lib/utils/formatters/shared';
import { getFeatureCollectionGeometryType } from '$lib/utils/geojson';

/**
 * Format the feature count and geometry type of a layer.
 *
 * @param layer The layer to format.
 * @returns The feature count and geometry type of the layer.
 */
export function formatFeatureCount(layer: CartoKitLayer): string {
  const { geometry, featureCount } =
    layer.source.type === 'vector'
      ? {
          geometry:
            layer.source.tilestats.layers[layer.source.sourceLayerIndex]
              .geometry,
          featureCount:
            layer.source.tilestats.layers[layer.source.sourceLayerIndex].count
        }
      : {
          geometry: getFeatureCollectionGeometryType(layer.source.data),
          featureCount: layer.source.data.features.length
        };

  return `${d3.format(',')(featureCount)} ${pluralize(geometry, featureCount)}`;
}
