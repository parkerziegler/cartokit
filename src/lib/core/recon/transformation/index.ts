import type { GeoJSONSource } from 'maplibre-gl';

import type { ReconFnParams, ReconFnResult } from '#lib/core/recon/index.ts';
import { db } from '#lib/state/db.svelte.ts';
import { map } from '#lib/state/map.svelte.ts';
import type { CartoKitTableSource } from '#lib/types/source.ts';
import { readTableAsGeoJSON } from '#lib/utils/db.ts';

/**
 * Reconcile transformation-related {@link CartoKitDiff}s based on the target
 * {@link CartoKitIR}.
 *
 * @param params A promise that resolves to the {@link ReconFnParams}, including
 * the current {@link CartoKitDiff} and target {@link CartoKitIR}.
 * @returns A promise that resolves to the {@link ReconFnResult}, including
 * the current {@link CartoKitDiff} and target {@link CartoKitIR}.
 */
export async function reconTransformationDiffs(
  params: Promise<ReconFnParams>
): Promise<ReconFnResult> {
  const { diff, targetIR } = await params;

  switch (diff.type) {
    case 'update-buffer-distance': {
      const layer = targetIR.layers[diff.layerId];
      const source = layer.source as CartoKitTableSource;

      // Read the rebuilt table and swap it into the layer's existing source.
      const geojson = await readTableAsGeoJSON(
        db.value!.conn,
        layer.id,
        source.table
      );

      map.value!.getSource<GeoJSONSource>(layer.id)?.setData(geojson);

      break;
    }
  }

  return {
    diff,
    targetIR
  };
}
