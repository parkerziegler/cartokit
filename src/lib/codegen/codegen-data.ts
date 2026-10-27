import type { CartoKitIR } from '$lib/types';
import type { CartokitCodegenDataFile } from '$lib/types/codegen';

/**
 * Generate the data files for all layers sourced from a file upload.
 *
 * @param ir The {@link CartoKitIR}.
 * @returns A Promise resolving to an Array of {@link CartokitCodegenDataFile}s.
 */
export async function codegenDataFiles(
  ir: CartoKitIR
): Promise<CartokitCodegenDataFile[]> {
  const encoder = new TextEncoder();

  return Promise.all(
    Object.values(ir.layers).flatMap((layer) => {
      if (layer.source.location.type !== 'file') {
        return [];
      }

      switch (layer.source.type) {
        case 'geojson':
          return {
            path: `src/data/${layer.source.location.file.name.replace(/\.geojson$/i, '.json')}`,
            bytes: encoder.encode(
              JSON.stringify(layer.source.sourceData, null, 2)
            )
          };
        case 'geoparquet': {
          const { file } = layer.source.location;

          return file.arrayBuffer().then((buffer) => ({
            path: `public/data/${file.name}`,
            bytes: new Uint8Array(buffer)
          }));
        }
        default:
          return [];
      }
    })
  );
}
