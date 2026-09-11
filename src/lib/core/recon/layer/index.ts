import * as Comlink from 'comlink';

import type { ReconFnParams, ReconFnResult } from '$lib/core/recon';
import { addLayer } from '$lib/interaction/layer';
import { catalog } from '$lib/state/catalog.svelte';
import { feature } from '$lib/state/feature.svelte';
import { map } from '$lib/state/map.svelte';
import type { CartoKitLayer, Catalog } from '$lib/types';
import { getAffiliatedLayerIds } from '$lib/utils/layer';
import { layerId } from '$lib/state/layerId.svelte';
import { redraw } from '$lib/utils/layer/redraw';
import { getCanonicalLayerId, getSourceId } from '$lib/utils/layer/id';
import { removeHoverListeners } from '$lib/interaction/hover';
import { removeSelectListeners } from '$lib/interaction/select';

/**
 * Reconcile layer-related {@link CartoKitDiff}s based on the target {@link CartoKitIR}.
 *
 * @param params A promise that resolves to the {@link ReconFnParams}, including
 * the current {@link CartoKitDiff} and target {@link CartoKitIR}.
 * @returns A promise that resolves to the {@link ReconFnResult}, including
 * the current {@link CartoKitDiff} and target {@link CartoKitIR}.
 */
export async function reconLayerDiffs(
  params: Promise<ReconFnParams>
): Promise<ReconFnResult> {
  const { diff, targetIR } = await params;

  switch (diff.type) {
    case 'add-layer': {
      const layer = targetIR.layers[diff.layerId];

      // Build the catalog for the layer in a worker thread.
      const catalogWorker = new Worker(
        new URL('$lib/utils/catalog/worker.ts', import.meta.url),
        { type: 'module' }
      );
      const buildCatalog =
        Comlink.wrap<(layer: CartoKitLayer) => Catalog>(catalogWorker);
      const catalogPatch = await buildCatalog(layer);
      catalog.value = { ...catalog.value, ...catalogPatch };

      // Add the source to the map.
      if (diff.payload.type === 'geojson') {
        map.value!.addSource(layer.id, {
          type: 'geojson',
          data:
            diff.payload.location.type === 'api'
              ? diff.payload.location.url // Use the API endpoint when available to speed up vector tile generation.
              : diff.payload.location.featureCollection,
          generateId: true
        });
      } else if (diff.payload.type === 'vector') {
        map.value!.addSource(layer.id, {
          type: 'vector',
          url: `pmtiles://${diff.payload.location.url}`
        });
      }

      addLayer(map.value!, layer);

      // Focus the map canvas after adding the layer.
      // Use a more specific selector to avoid focusing maps in the BasemapPicker.
      document
        .querySelector<HTMLCanvasElement>(
          '#map > .maplibregl-canvas-container > canvas.maplibregl-canvas'
        )
        ?.focus();
      break;
    }
    case 'layer-visibility': {
      const layer = targetIR.layers[diff.layerId];

      if (diff.payload.visible) {
        map.value!.setLayoutProperty(layer.id, 'visibility', 'visible');

        // Ensure the stroke layer, if present, is made visible.
        if (map.value!.getLayer(`${layer.id}-stroke`)) {
          map.value!.setLayoutProperty(
            `${layer.id}-stroke`,
            'visibility',
            'visible'
          );
        }
      } else {
        map.value!.setLayoutProperty(layer.id, 'visibility', 'none');

        // Ensure the stroke layer, if present, is hidden.
        if (map.value!.getLayer(`${layer.id}-stroke`)) {
          map.value!.setLayoutProperty(
            `${layer.id}-stroke`,
            'visibility',
            'none'
          );
        }
      }

      break;
    }
    case 'layer-tooltip-visibility': {
      break;
    }
    case 'remove-layer': {
      const affiliatedLayerIds = getAffiliatedLayerIds(
        map.value!,
        diff.layerId
      );
      const affiliatedSourceIds = new Set(
        affiliatedLayerIds.map((id) => getSourceId(map.value!, id))
      );

      // Remove all event listeners for the layer and its affiliated layers.
      removeHoverListeners(map.value!, affiliatedLayerIds);
      removeSelectListeners(map.value!, affiliatedLayerIds);

      // Remove the layer and its affiliated layers. Every affiliated layer
      // must go before its source does, as MapLibre refuses to remove a source
      // still in use.
      affiliatedLayerIds.forEach((id) => {
        map.value!.removeLayer(id);
      });

      // If the removed layer was selected, set layerId to null.
      if (layerId.value === diff.layerId) {
        layerId.value = null;
      }

      // If the selected feature belongs to the removed layer, set feature to null.
      if (
        feature.value &&
        getCanonicalLayerId(feature.value.layerId) === diff.layerId
      ) {
        feature.value = null;
      }

      // Remove the sources backing the removed layers.
      affiliatedSourceIds.forEach((id) => {
        if (map.value!.getSource(id)) {
          map.value!.removeSource(id);
        }
      });

      break;
    }
    case 'rename-layer': {
      break;
    }
    case 'source-layer': {
      const targetLayer = targetIR.layers[diff.layerId];

      redraw({
        map: map.value!,
        sourceLayerId: diff.layerId,
        targetLayer
      });

      break;
    }
  }

  return {
    diff,
    targetIR
  };
}
