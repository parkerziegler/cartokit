import * as d3 from 'd3';

import type { CartoKitLayer } from '$lib/types';
import { pluralize } from '$lib/utils/formatters/shared';
import { getFeatureCollectionGeometryType } from '$lib/utils/geojson';
import { selectTileStats } from '$lib/utils/pmtiles';

/**
 * Format the feature count and geometry type of a layer.
 *
 * @param layer The layer to format.
 * @returns The feature count and geometry type of the layer.
 */
export function formatFeatureCount(layer: CartoKitLayer): string {
  const { geometry, count } =
    layer.source.type === 'vector'
      ? selectTileStats(layer.source)
      : {
          geometry: getFeatureCollectionGeometryType(layer.source.data),
          count: layer.source.data.features.length
        };

  return `${d3.format(',')(count)} ${pluralize(geometry, count)}`;
}
