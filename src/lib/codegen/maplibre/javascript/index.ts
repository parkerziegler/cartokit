import * as prettier from 'prettier';
import babel from 'prettier/plugins/babel';
import estree from 'prettier/plugins/estree';

import { analyzeIR } from '$lib/codegen/analysis';
import { codegenImports } from '$lib/codegen/maplibre/javascript/codegen-imports';
import type { CartoKitIR } from '$lib/types';

/**
 * Generate a JavaScript program using MapLibre GL JS from the CartoKit IR.
 *
 * @param ir – The CartoKit IR.
 * @returns – A JavaScript program.
 */
export async function codegen(ir: CartoKitIR): Promise<string> {
  const analysis = analyzeIR(ir, 'javascript');

  const program = codegenImports(ir, analysis);

  const formatted = await prettier.format(program, {
    parser: 'babel',
    plugins: [babel, estree]
  });

  return formatted;
}
