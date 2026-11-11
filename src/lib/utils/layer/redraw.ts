import type { Map } from 'maplibre-gl';

import { addLayer } from '$lib/interaction/layer';
import { removeLayerListeners } from '$lib/interaction/events';
import { feature } from '$lib/state/feature.svelte';
import type { CartoKitLayer } from '$lib/types';
import { getAffiliatedLayerIds } from '$lib/utils/layer';
import { getCanonicalLayerId, getSourceId } from '$lib/utils/layer/id';

/**
 * Redraw a layer on the map given the source and target layer definitions.
 *
 * @param map The {@link Map} instance.
 * @param sourceLayerId The id of the source layer.
 * @param targetLayer The definition of the target layer.
 */
export function redraw(
  map: Map,
  sourceLayerId: string,
  targetLayer: CartoKitLayer
): void {
  const affiliatedLayerIds = getAffiliatedLayerIds(map, sourceLayerId);
  const sourceId = getSourceId(map, sourceLayerId);

  // Remove all event listeners for the existing layer and affiliated layers.
  removeLayerListeners(map, affiliatedLayerIds);

  // The removed listeners tracked the hovered and selected features in
  // closures, so the new listeners can't clear them. Clear the source's feature
  // state, which is shared by the layer's affiliated layers, so that no feature
  // is left highlighted.
  if (map.getSource(sourceId)) {
    map.removeFeatureState({ source: sourceId });
  }

  // If the selected feature belongs to the redrawn layer, deselect it.
  if (
    feature.value &&
    getCanonicalLayerId(feature.value.layerId) === sourceLayerId
  ) {
    feature.value = null;
  }

  affiliatedLayerIds.forEach((id) => map.removeLayer(id));

  // Add the new layer. This function call includes instrumentation.
  addLayer(map, targetLayer);
}
