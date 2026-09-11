import type * as maplibregl from 'maplibre-gl';

import { addLayer } from '$lib/interaction/layer';
import { removeHoverListeners } from '$lib/interaction/hover';
import { removeSelectListeners } from '$lib/interaction/select';
import type { CartoKitLayer } from '$lib/types';
import { getAffiliatedLayerIds } from '$lib/utils/layer';

interface RedrawParams {
  map: maplibregl.Map;
  sourceLayerId: string;
  targetLayer: CartoKitLayer;
}

/**
 * Redraw a layer on the map given the source and target layer definitions.
 *
 * @param params.map The {@link maplibregl.Map} instance.
 * @param params.sourceLayerId The id of the source layer.
 * @param params.targetLayer The definition of the target layer.
 */
export function redraw(params: RedrawParams): void {
  const { map, sourceLayerId, targetLayer } = params;

  const affiliatedLayerIds = getAffiliatedLayerIds(map, sourceLayerId);

  // Remove all event listeners for the existing layer and its affiliated
  // layers.
  removeHoverListeners(map, affiliatedLayerIds);
  removeSelectListeners(map, affiliatedLayerIds);

  // Remove the existing layer and its affiliated layers.
  affiliatedLayerIds.forEach((id) => {
    map.removeLayer(id);
  });

  if (targetLayer.source.type === 'geojson') {
    // Update the source with the new data.
    (map.getSource(sourceLayerId) as maplibregl.GeoJSONSource).setData(
      targetLayer.source.data
    );
  }

  // Add the new layer. This function call includes instrumentation.
  addLayer(map, targetLayer);
}
