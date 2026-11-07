import { db } from '$lib/state/db.svelte';
import type { CartoKitIR } from '$lib/types';
import type { CartokitCodegenDataFile } from '$lib/types/codegen';
import { copyTableToGeoJSON } from '$lib/utils/geojson';
import { copyTableToGeoParquet } from '$lib/utils/geoparquet';

/**
 * Generate the data files for all layers sourced from a file upload.
 *
 * @param ir The {@link CartoKitIR}.
 * @returns A Promise resolving to an Array of {@link CartokitCodegenDataFile}s.
 */
export async function codegenDataFiles(
  ir: CartoKitIR
): Promise<CartokitCodegenDataFile[]> {
  return Promise.all(
    Object.values(ir.layers).flatMap((layer) => {
      if (layer.source.location.type !== 'file') {
        return [];
      }

      switch (layer.source.type) {
        case 'geojson': {
          const { file } = layer.source.location;

          return copyTableToGeoJSON(
            db.value!.db,
            db.value!.conn,
            layer.id,
            layer.displayName,
            layer.source.table
          )
            .then((blob) => blob.bytes())
            .then((bytes) => ({
              path: `public/data/${file.name}`,
              bytes
            }));
        }
        case 'geoparquet': {
          const { file } = layer.source.location;

          return copyTableToGeoParquet(
            db.value!.db,
            db.value!.conn,
            layer.id,
            layer.displayName
          )
            .then((blob) => blob.bytes())
            .then((bytes) => ({
              path: `public/data/${file.name}`,
              bytes
            }));
        }
        case 'pmtiles':
        case 'table':
          return [];
      }
    })
  );
}
