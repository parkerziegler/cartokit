import * as Comlink from 'comlink';

import type { CartoKitDiff } from '$lib/core/diff';
import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';
import { catalog } from '$lib/state/catalog.svelte';
import type { CartoKitGeoJSONSource, CartoKitLayer, Catalog } from '$lib/types';
import {
  upsertGeometricTransformation,
  upsertUserTransformation
} from '$lib/utils/transformation';
import type { TransformationCall } from '$lib/types/transformation';
import type { FeatureCollection } from 'geojson';

/**
 * Replay a set of transformations against a source's original data, then update
 * the source's data and transformations and rebuild the layer's catalog.
 *
 * @param layer The {@link CartoKitLayer} to update, backed by a GeoJSON source.
 * @param source The layer's {@link CartoKitGeoJSONSource}.
 * @param transformations The full, ordered list of {@link TransformationCall}s
 * to replay against the source data.
 */
async function replayTransformationsWithCatalogUpdates(
  layer: CartoKitLayer,
  source: CartoKitGeoJSONSource,
  transformations: TransformationCall[]
) {
  const transformationWorker = new Worker(
    new URL('$lib/utils/transformation/worker.ts', import.meta.url),
    { type: 'module' }
  );

  try {
    const { replayTransformations } = Comlink.wrap<{
      replayTransformations: (
        sourceData: FeatureCollection,
        transformations: TransformationCall[]
      ) => FeatureCollection;
    }>(transformationWorker);

    source.data = await replayTransformations(
      source.sourceData,
      transformations
    );
  } finally {
    transformationWorker.terminate();
  }

  source.transformations = transformations;

  // Rebuild the catalog for the layer in a worker thread.
  const catalogWorker = new Worker(
    new URL('$lib/utils/catalog/worker.ts', import.meta.url),
    { type: 'module' }
  );

  try {
    const buildCatalog =
      Comlink.wrap<(layer: CartoKitLayer) => Catalog>(catalogWorker);
    const catalogPatch = await buildCatalog(layer);
    catalog.value = { ...catalog.value, ...catalogPatch };
  } finally {
    catalogWorker.terminate();
  }
}

/**
 * Patch transformation-related {@link CartoKitDiff}s for the current {@link CartoKitIR}.
 *
 * @param params A promise that resolves to the {@link PatchFnParams}, including
 * the current {@link CartoKitDiff} and {@link CartoKitIR}.
 * @returns A promise that resolves to the {@link PatchFnResult}, including
 * the current {@link CartoKitDiff} and patched {@link CartoKitIR}.
 */
export async function patchTransformationDiffs(
  params: Promise<PatchFnParams>
): Promise<PatchFnResult> {
  const { diff, ir, inverseDiff } = await params;

  let inverse: CartoKitDiff = inverseDiff;

  switch (diff.type) {
    case 'add-transformation': {
      const layer = ir.layers[diff.layerId];

      // Transformations can only be applied to in-memory data; vector sources
      // are always pre-computed and cannot be modified on-the-fly.
      if (layer.source.type === 'vector') {
        break;
      }

      const { transformation } = diff.payload;

      const replaced = layer.source.transformations.find(
        ({ kind }) => kind === 'user'
      );

      // Derive the inverse diff prior to applying the patch. Replacing an
      // existing transformation inverts to restoring it, not removing it.
      inverse = replaced
        ? {
            type: 'add-transformation',
            layerId: diff.layerId,
            payload: { transformation: replaced }
          }
        : {
            type: 'remove-transformation',
            layerId: diff.layerId,
            payload: { transformationName: transformation.name }
          };

      // Apply the patch.
      await replayTransformationsWithCatalogUpdates(
        layer,
        layer.source,
        transformation.kind === 'user'
          ? upsertUserTransformation(
              layer.source.transformations,
              transformation
            )
          : upsertGeometricTransformation(
              layer.source.transformations,
              transformation
            )
      );
      break;
    }
    case 'remove-transformation': {
      const layer = ir.layers[diff.layerId];

      if (layer.source.type === 'geojson') {
        // Find the transformation before removing it so we can create the inverse.
        const tIdx = layer.source.transformations.findIndex(
          (t) => t.name === diff.payload.transformationName
        );

        if (tIdx > -1) {
          const transformation = layer.source.transformations[tIdx];

          // Derive the inverse diff prior to applying the patch.
          inverse = {
            type: 'add-transformation',
            layerId: diff.layerId,
            payload: { transformation }
          };

          // Apply the patch.
          await replayTransformationsWithCatalogUpdates(
            layer,
            layer.source,
            layer.source.transformations.toSpliced(tIdx, 1)
          );
        }
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
