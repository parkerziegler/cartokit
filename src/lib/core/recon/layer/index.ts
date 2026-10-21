import type { ReconFnParams, ReconFnResult } from '$lib/core/recon';
import { removeLayerListeners } from '$lib/interaction/events';
import { addLayer } from '$lib/interaction/layer';
import { catalog } from '$lib/state/catalog.svelte';
import { db } from '$lib/state/db.svelte';
import { feature } from '$lib/state/feature.svelte';
import { layerId } from '$lib/state/layerId.svelte';
import { map } from '$lib/state/map.svelte';
import { readTableAsGeoJSON } from '$lib/utils/db';
import { getAffiliatedLayerIds } from '$lib/utils/layer';
import { getCanonicalLayerId, getSourceId } from '$lib/utils/layer/id';
import { redraw } from '$lib/utils/layer/redraw';

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

      // Add the source to the map.
      switch (layer.source.type) {
        case 'geojson': {
          map.value!.addSource(layer.id, {
            type: 'geojson',
            data: layer.source.data,
            generateId: true
          });
          break;
        }
        case 'geoparquet': {
          // Reuse the columns described when the table was created.
          const entry = catalog.value[layer.id];
          const geojson = await readTableAsGeoJSON(
            db.value!.conn,
            layer.id,
            entry.type === 'geoparquet' ? entry.columns : undefined
          );

          map.value!.addSource(layer.id, {
            type: 'geojson',
            data: geojson,
            generateId: true
          });
          break;
        }
        case 'vector': {
          map.value!.addSource(layer.id, {
            type: 'vector',
            url: `pmtiles://${layer.source.location.url}`
          });
          break;
        }
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
      removeLayerListeners(map.value!, affiliatedLayerIds);

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
