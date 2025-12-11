import * as prettier from 'prettier';
import estree from 'prettier/plugins/estree';
import typescript from 'prettier/plugins/typescript';
import babel from 'prettier/plugins/babel';

import { analyzeIR } from '$lib/codegen/analysis';
import { codegenImports } from '$lib/codegen/codegen-imports';
import type { CartoKitBackend, CartoKitIR } from '$lib/types';

/**
 * Generate a program from the CartoKit IR.
 *
 * @param ir – The CartoKit IR.
 * @returns – A program.
 */
export async function codegen(
  ir: CartoKitIR,
  language: CartoKitBackend['language'],
  library: CartoKitBackend['library']
): Promise<string> {
  const analysis = analyzeIR(ir, language, library);

  const program = codegenImports(ir, analysis);

  const formatted = await prettier.format(program, {
    parser: language === 'typescript' ? 'typescript' : 'babel',
    plugins: [language === 'typescript' ? typescript : babel, estree]
  });

  return formatted;
}
