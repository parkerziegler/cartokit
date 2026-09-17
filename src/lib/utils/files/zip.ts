import { strToU8, zipSync, type Zippable } from 'fflate';

import favicon from '$lib/utils/files/favicon.svg?raw';

import { codegenDataFiles } from '$lib/codegen/codegen-data';
import type { CartoKitIR } from '$lib/types';
import type { CartokitCodegenFile } from '$lib/types/codegen';

/**
 * Bundle a cartokit-generated Vite project into a .zip archive.
 *
 * @param ir The {@link CartoKitIR}.
 * @param files The program files produced by code generation.
 * @param rootDir The name of the directory containing the project.
 * @returns A Blob containing the .zip archive.
 */
export function zipProject(
  ir: CartoKitIR,
  files: CartokitCodegenFile[],
  rootDir: string
): Blob {
  // Vite serves public/ at the root, matching the /favicon.svg link in the
  // generated index.html.
  const entries: Zippable = {
    [`${rootDir}/public/favicon.svg`]: strToU8(favicon)
  };

  for (const file of [...files, ...codegenDataFiles(ir)]) {
    entries[`${rootDir}/${file.path}`] = strToU8(file.text);
  }

  return new Blob([zipSync(entries)], { type: 'application/zip' });
}
