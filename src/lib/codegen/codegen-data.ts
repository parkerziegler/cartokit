import type { CartoKitIR } from '$lib/types';
import type { CartokitCodegenFile } from '$lib/types/codegen';

/**
 * Derive the data file name for an uploaded GeoJSON file. Vite only parses
 * modules with a .json extension as JSON, so the uploaded file's stem is kept
 * and its extension replaced (e.g., data.geojson → data.json).
 *
 * @param fileName The name of the uploaded file.
 * @returns The name of the data file, relative to src/data.
 */
export function codegenDataFileName(fileName: string): string {
  return `${fileName.replace(/\.[^.]+$/, '')}.json`;
}

/**
 * Generate the data files for all GeoJSON layers sourced from a file upload.
 * These are kept separate from the program files shown in the editor, since
 * formatting and displaying large GeoJSON documents would be prohibitively
 * expensive.
 *
 * @param ir The {@link CartoKitIR}.
 * @returns An Array of {@link CartokitCodegenFile}, one per uploaded layer.
 */
export function codegenDataFiles(ir: CartoKitIR): CartokitCodegenFile[] {
  return Object.values(ir.layers).flatMap((layer) =>
    layer.source.type === 'geojson' && layer.source.location.type === 'file'
      ? {
          path: `src/data/${codegenDataFileName(layer.source.location.fileName)}`,
          text: JSON.stringify(layer.source.sourceData, null, 2),
          language: 'json' as const
        }
      : []
  );
}
