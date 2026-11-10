import type { CartoKitDiff } from '$lib/core/diff';
import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';
import { generateCartoKitLayer } from '$lib/interaction/layer';
import { catalog } from '$lib/state/catalog.svelte';
import { db } from '$lib/state/db.svelte';
import type { CartoKitSource } from '$lib/types/source';
import { buildCatalog } from '$lib/utils/catalog';
import { createTable } from '$lib/utils/db';
import { CartoKitPMTiles } from '$lib/utils/pmtiles';

/**
 * Patch layer-related {@link CartoKitDiff}s for the current {@link CartoKitIR}.
 *
 * @param params A promise that resolves to the {@link PatchFnParams}, including
 * the current {@link CartoKitDiff} and {@link CartoKitIR}.
 * @returns A promise that resolves to the {@link PatchFnResult}, including
 * the current {@link CartoKitDiff} and patched {@link CartoKitIR}.
 */
export async function patchLayerDiffs(
  params: Promise<PatchFnParams>
): Promise<PatchFnResult> {
  const { diff, ir, inverseDiff } = await params;

  let inverse: CartoKitDiff = inverseDiff;

  switch (diff.type) {
    case 'add-layer': {
      // Check if the layer was previously soft deleted; if so, we can just
      // toggle the flag. Hard deleted layers will not exist in the IR, hence
      // the need for optional chaining.
      if (ir.layers[diff.layerId]?.layout?.deleted) {
        const layer = ir.layers[diff.layerId];
        layer.layout.deleted = false;

        inverse = {
          type: 'remove-layer',
          layerId: diff.layerId,
          payload: {
            sourceLayerType: layer.type,
            strategy: 'soft'
          }
        };
        break;
      }

      let source: CartoKitSource;

      switch (diff.payload.type) {
        case 'pmtiles': {
          const pmtiles = new CartoKitPMTiles(diff.payload.location.url);

          const [metadata, vectorLayers] = await Promise.all([
            pmtiles.getMetadata(),
            pmtiles.getVectorLayers()
          ]);

          source = {
            type: 'pmtiles',
            location: diff.payload.location,
            sourceLayerId: vectorLayers[0].id,
            tilestats: metadata.tilestats,
            vectorLayers
          };
          break;
        }
        case 'geojson':
        case 'geoparquet':
          source = {
            type: diff.payload.type,
            location: diff.payload.location,
            table: await createTable({
              db: db.value!.db,
              conn: db.value!.conn,
              layerId: diff.layerId,
              location: diff.payload.location
            })
          };
          break;
        case 'table':
          source = {
            type: 'table',
            location: diff.payload.location,
            table: await createTable({
              db: db.value!.db,
              conn: db.value!.conn,
              layerId: diff.layerId,
              location: diff.payload.location
            })
          };
          break;
      }

      // Build the catalog entry.
      const catalogPatch = await buildCatalog(
        diff.layerId,
        source,
        db.value!.conn
      );
      catalog.value = { ...catalog.value, ...catalogPatch };

      const layer = generateCartoKitLayer(
        source,
        diff.layerId,
        diff.payload.displayName
      );

      // Derive the inverse diff after creating the layer.
      inverse = {
        type: 'remove-layer',
        layerId: diff.layerId,
        payload: {
          sourceLayerType: layer.type,
          strategy: 'hard'
        }
      };

      // Apply the patch.
      ir.layers[diff.layerId] = layer;
      break;
    }
    case 'layer-visibility': {
      const layer = ir.layers[diff.layerId];

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'layer-visibility',
        layerId: diff.layerId,
        payload: {
          visible: layer.layout.visible
        }
      };

      // Apply the patch.
      layer.layout.visible = diff.payload.visible;

      break;
    }
    case 'layer-tooltip-visibility': {
      const layer = ir.layers[diff.layerId];

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'layer-tooltip-visibility',
        layerId: diff.layerId,
        payload: {
          visible: layer.layout.tooltip.visible
        }
      };

      // Apply the patch.
      layer.layout.tooltip.visible = diff.payload.visible;

      break;
    }
    case 'remove-layer': {
      const layer = ir.layers[diff.layerId];

      // Derive the inverse diff prior to applying the patch.
      switch (layer.source.type) {
        case 'pmtiles':
          inverse = {
            type: 'add-layer',
            layerId: diff.layerId,
            payload: {
              type: 'pmtiles',
              displayName: layer.displayName,
              location: layer.source.location
            }
          };
          break;
        case 'geojson':
        case 'geoparquet':
        case 'table':
          inverse = {
            type: 'add-layer',
            layerId: diff.layerId,
            payload: {
              ...layer.source,
              displayName: layer.displayName
            }
          };
      }

      // If using a hard delete strategy, drop the layer's table and delete it.
      if (diff.payload.strategy === 'hard') {
        await db.value!.conn.query(`DROP TABLE IF EXISTS ${diff.layerId};`);
        delete ir.layers[diff.layerId];
      } else {
        // Otherwise, flag the layer as soft deleted.
        ir.layers[diff.layerId].layout.deleted = true;
      }

      break;
    }
    case 'rename-layer': {
      const layer = ir.layers[diff.layerId];

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'rename-layer',
        layerId: diff.layerId,
        payload: {
          displayName: layer.displayName
        }
      };

      // Apply the patch.
      layer.displayName = diff.payload.displayName;

      break;
    }
    case 'source-layer': {
      const layer = ir.layers[diff.layerId];

      if (layer.source.type === 'pmtiles') {
        // Derive the inverse diff prior to applying the patch.
        inverse = {
          type: 'source-layer',
          layerId: diff.layerId,
          payload: {
            sourceSourceLayerId: diff.payload.targetSourceLayerId,
            targetSourceLayerId: layer.source.sourceLayerId
          }
        };

        // Apply the patch.
        layer.source.sourceLayerId = diff.payload.targetSourceLayerId;
      }

      break;
    }
  }

  return {
    diff,
    ir,
    inverseDiff: inverse
  };
}
