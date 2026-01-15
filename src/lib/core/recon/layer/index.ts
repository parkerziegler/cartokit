import * as Comlink from 'comlink';

import type { ReconFnParams, ReconFnResult } from '$lib/core/recon';
import { addLayer } from '$lib/interaction/layer';
import { catalog } from '$lib/state/catalog.svelte';
import { feature } from '$lib/state/feature.svelte';
import { listeners, type LayerListeners } from '$lib/state/listeners.svelte';
import { map } from '$lib/state/map.svelte';
import type { CartoKitLayer, Catalog } from '$lib/types';
import { getInstrumentedLayerIds } from '$lib/utils/layer';

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

      map.value!.addSource(layer.id, {
        type: 'geojson',
        // Still use the API endpoint when available to speed up vector tile generation.
        data:
          diff.payload.type === 'api'
            ? diff.payload.url
            : diff.payload.featureCollection,
        generateId: true
      });

      // Build the catalog for the layer in a worker thread.
      const catalogWorker = new Worker(
        new URL('$lib/utils/catalog/worker.ts', import.meta.url),
        { type: 'module' }
      );
      const buildCatalog =
        Comlink.wrap<(layer: CartoKitLayer) => Catalog>(catalogWorker);
      const catalogPatch = await buildCatalog(layer);
      catalog.value = { ...catalog.value, ...catalogPatch };

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
      // Remove all event listeners for the layer.
      if (listeners.value.has(diff.layerId)) {
        Object.entries(listeners.value.get(diff.layerId)!).forEach(
          ([event, listener]) => {
            map.value!.off(
              event as keyof LayerListeners,
              diff.layerId,
              listener
            );
          }
        );

        listeners.value.delete(diff.layerId);
      }

      // Remove the layer.
      map.value!.removeLayer(diff.layerId);

      // If the selected feature belongs to the removed layer, set the feature to null.
      if (feature.value?.layer.id === diff.layerId) {
        feature.value = null;
      }

      // Remove all instrumented layers.
      getInstrumentedLayerIds(
        diff.layerId,
        diff.payload.sourceLayerType
      ).forEach((id) => {
        if (map.value!.getLayer(id)) {
          map.value!.removeLayer(id);
        }
      });

      // Remove the source.
      map.value!.removeSource(diff.layerId);

      // Remove the outlines source for dot density layers.
      if (map.value!.getSource(`${diff.layerId}-outlines`)) {
        map.value!.removeSource(`${diff.layerId}-outlines`);
      }

      // Remove the points source for heatmaps.
      if (map.value!.getSource(`${diff.layerId}-points`)) {
        map.value!.removeSource(`${diff.layerId}-points`);
      }

      break;
    }
    case 'rename-layer': {
      break;
    }
  }

  return {
    diff,
    targetIR
  };
}
