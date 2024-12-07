import * as prettier from 'prettier';
import babel from 'prettier/plugins/babel';
// eslint-disable-next-line import/default
import estree from 'prettier/plugins/estree';

import { codegenImports } from '$lib/codegen/maplibre/codegen-imports';
import type { CartoKitIR } from '$lib/types';

/**
 * Generate a JavaScript program using MapLibre GL JS from the CartoKit IR.
 *
 * @param ir – The CartoKit IR.
 * @returns – A JavaScript program.
 */
export async function codegen(ir: CartoKitIR): Promise<string> {
  const program = codegenImports(ir);
  const formatted = await prettier.format(program, {
    parser: 'babel',
    plugins: [babel, estree]
  });

  return formatted;
}
