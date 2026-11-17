import { strToU8, zipSync, type Zippable } from 'fflate';

import favicon from '#lib/utils/favicon.svg?raw';

import { codegenDataFiles } from '#lib/codegen/codegen-data.ts';
import type { CartoKitIR } from '#lib/types/index.ts';
import type { CartokitCodegenProgramFile } from '#lib/types/codegen.ts';
import type { DuckDBState } from '#lib/types/db.ts';

/**
 * Bundle a cartokit-generated Vite project into a .zip archive.
 *
 * @param ir The {@link CartoKitIR}.
 * @param files The program files produced by code generation.
 * @param rootDir The name of the directory containing the project.
 * @param client The {@link DuckDBState} holding the layers' tables.
 * @returns A Promise resolving to a Blob containing the .zip archive.
 */
export async function zipProject(
  ir: CartoKitIR,
  files: CartokitCodegenProgramFile[],
  rootDir: string,
  client: DuckDBState
): Promise<Blob> {
  const entries: Zippable = {
    [`${rootDir}/public/favicon.svg`]: strToU8(favicon)
  };

  for (const file of files) {
    entries[`${rootDir}/${file.path}`] = strToU8(file.text);
  }

  for (const file of await codegenDataFiles(ir, client)) {
    entries[`${rootDir}/${file.path}`] = file.bytes;
  }

  return new Blob([zipSync(entries)], { type: 'application/zip' });
}
