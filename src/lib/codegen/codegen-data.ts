import type { CartoKitIR } from '#lib/types/index.ts';
import type { CartokitCodegenDataFile } from '#lib/types/codegen.ts';
import type { DuckDBState } from '#lib/types/db.ts';
import { copyTableToGeoJSON } from '#lib/utils/geojson.ts';
import { copyTableToGeoParquet } from '#lib/utils/geoparquet.ts';
import { isLayerDataRequired } from '#lib/utils/ir.ts';

/**
 * Generate a {@link CartokitCodegenDataFile} from a layer's exported data.
 *
 * @param path The relative path of the file on disk.
 * @param data A Promise resolving to a Blob of the layer's exported data.
 * @returns A Promise resolving to a {@link CartokitCodegenDataFile}.
 */
async function codegenDataFile(
  path: string,
  data: Promise<Blob>
): Promise<CartokitCodegenDataFile> {
  const blob = await data;

  return { path, bytes: await blob.bytes() };
}

/**
 * Generate the data files for all layers sourced from a file upload.
 *
 * @param ir The {@link CartoKitIR}.
 * @param client The {@link DuckDBClient} holding the layers' tables.
 * @returns A Promise resolving to an Array of {@link CartokitCodegenDataFile}s.
 */
export async function codegenDataFiles(
  ir: CartoKitIR,
  { db, conn }: DuckDBState
): Promise<CartokitCodegenDataFile[]> {
  return Promise.all(
    Object.values(ir.layers).flatMap((layer) => {
      // Skip layers that were not uploaded as files or orphaned soft-
      // deleted layers that are never read by the generated program.
      if (
        layer.source.location.type !== 'file' ||
        !isLayerDataRequired(ir, layer.id)
      ) {
        return [];
      }

      const path = `public/data/${layer.source.location.file.name}`;
      const params = {
        db,
        conn,
        layerId: layer.id,
        displayName: layer.displayName
      };

      switch (layer.source.type) {
        case 'geojson':
          return codegenDataFile(
            path,
            copyTableToGeoJSON({ ...params, table: layer.source.table })
          );
        case 'geoparquet':
          return codegenDataFile(path, copyTableToGeoParquet(params));
        case 'pmtiles':
        case 'table':
          return [];
      }
    })
  );
}
