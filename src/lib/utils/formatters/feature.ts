import * as d3 from 'd3';

import type { CartoKitSource } from '$lib/types';
import { pluralize } from '$lib/utils/formatters/shared';
import { getFeatureCollectionGeometryType } from '$lib/utils/geojson';
import { selectTileStats } from '$lib/utils/pmtiles';

/**
 * Format the feature count and geometry type of a {@link CartoKitSource}.
 *
 * @param source A {@link CartoKitSource}.
 * @returns The feature count and geometry type of the source.
 */
export function formatFeatureCount(source: CartoKitSource): string {
  const { geometry, count } =
    source.type === 'vector'
      ? selectTileStats(source)
      : {
          geometry: getFeatureCollectionGeometryType(source.data),
          count: source.data.features.length
        };

  return `${d3.format(',')(count)} ${pluralize(geometry, count)}`;
}
