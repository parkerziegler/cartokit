import * as prettier from 'prettier';
// eslint-disable-next-line import/default
import estree from 'prettier/plugins/estree';
import typescript from 'prettier/plugins/typescript';

import { analyzeIR } from '$lib/codegen/analysis';
import { codegenImports } from '$lib/codegen/mapbox/typescript/codegen-imports';
import type { CartoKitIR } from '$lib/types';

/**
 * Generate a Mapbox GL JS program, in TypeScript, from the CartoKit IR.
 *
 * @param ir – The CartoKit IR.
 * @returns – A Mapbox GL JS program, in TypeScript.
 */
export async function codegen(ir: CartoKitIR): Promise<string> {
  const analysis = analyzeIR(ir, 'typescript');

  const program = codegenImports(ir, analysis);

  const formatted = await prettier.format(program, {
    parser: 'typescript',
    plugins: [typescript, estree]
  });

  return formatted;
}
