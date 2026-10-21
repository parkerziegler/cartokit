import * as d3 from 'd3';

import { pluralize } from '$lib/utils/formatters/shared';
import { catalog } from '$lib/state/catalog.svelte';

/**
 * Format the feature count and geometry type of a {@link CartoKitSource}.
 *
 * @param source A {@link CartoKitSource}.
 * @returns The feature count and geometry type of the source, formatted as a
 * string.
 */
export function formatFeatureCount(layerId: string): string {
  const { geometryType, count } = catalog.value[layerId];

  return `${d3.format(',')(count)} ${pluralize(geometryType, count)}`;
}
