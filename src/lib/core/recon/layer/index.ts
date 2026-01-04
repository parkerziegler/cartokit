import * as Comlink from 'comlink';

import type { ReconFnParams, ReconFnResult } from '$lib/core/recon';
import { addLayer } from '$lib/interaction/layer';
import { map } from '$lib/state/map.svelte';
import { catalog } from '$lib/state/catalog.svelte';
import type { CartoKitLayer, Catalog } from '$lib/types';
import { feature } from '$lib/state/feature.svelte';

export async function reconLayerDiffs(
  params: Promise<ReconFnParams>
): Promise<ReconFnResult> {
  const { diff, sourceIR, targetIR } = await params;

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

      if (diff.payload.visibility === 'visible') {
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
      // Remove the main layer.
      map.value!.removeLayer(diff.layerId);

      // If the selected feature belongs to the removed layer, set the feature to null.
      if (feature.value?.layer.id === diff.layerId) {
        feature.value = null;
      }

      // Remove all instrumented layers.
      [
        'stroke',
        'outlines',
        'points',
        'hover',
        'select',
        'outlines-hover',
        'outlines-select',
        'points-hover',
        'points-select'
      ].forEach((modifier) => {
        if (map.value!.getLayer(`${diff.layerId}-${modifier}`)) {
          map.value!.removeLayer(`${diff.layerId}-${modifier}`);
        }
      });

      // Remove the source.
      map.value!.removeSource(diff.layerId);

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
    sourceIR,
    targetIR
  };
}
