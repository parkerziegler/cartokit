import { strToU8, zipSync, type Zippable } from 'fflate';

import favicon from '#lib/utils/favicon.svg?raw';

import { codegenDataFiles } from '#lib/codegen/codegen-data.ts';
import type { CartoKitIR } from '#lib/types/index.ts';
import type { CartokitCodegenProgramFile } from '#lib/types/codegen.ts';
import type { DuckDBState } from '#lib/types/db.ts';

interface ZipProjectParams {
  ir: CartoKitIR;
  files: CartokitCodegenProgramFile[];
  rootDir: string;
  dbState: DuckDBState;
}

/**
 * Bundle a cartokit-generated Vite project into a .zip archive.
 *
 * @param params The {@link ZipProjectParams}.
 * @param params.ir The {@link CartoKitIR}.
 * @param params.files The program files produced by code generation.
 * @param params.rootDir The name of the directory containing the project.
 * @param params.dbState The {@link DuckDBState} holding the layers' tables.
 * @returns A Promise resolving to a Blob containing the .zip archive.
 */
export async function zipProject({
  ir,
  files,
  rootDir,
  dbState
}: ZipProjectParams): Promise<Blob> {
  const entries: Zippable = {
    [`${rootDir}/public/favicon.svg`]: strToU8(favicon)
  };

  for (const file of files) {
    entries[`${rootDir}/${file.path}`] = strToU8(file.text);
  }

  for (const file of await codegenDataFiles(ir, dbState)) {
    entries[`${rootDir}/${file.path}`] = file.bytes;
  }

  return new Blob([zipSync(entries)], { type: 'application/zip' });
}
