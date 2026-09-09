import * as prettier from 'prettier';
import babel from 'prettier/plugins/babel';
import estree from 'prettier/plugins/estree';
import html from 'prettier/plugins/html';
import postcss from 'prettier/plugins/postcss';
import typescript from 'prettier/plugins/typescript';

import { analyzeIR } from '$lib/codegen/analysis';
import { codegenCSS } from '$lib/codegen/codegen-css';
import { codegenHTML } from '$lib/codegen/codegen-html';
import { codegenImports } from '$lib/codegen/codegen-imports';
import type { CartoKitIR } from '$lib/types';
import type {
  CartoKitBackend,
  CartokitCodegenFile,
  CartokitCodegenLanguage
} from '$lib/types/codegen';

async function format(text: string, language: CartokitCodegenLanguage) {
  let parser;
  let plugins: prettier.Plugin[] = [];

  switch (language) {
    case 'css':
      parser = 'css';
      plugins = [postcss];
      break;
    case 'html':
      parser = 'html';
      plugins = [html];
      break;
    case 'javascript':
      parser = 'babel';
      plugins = [babel, estree];
      break;
    case 'json':
      parser = 'json';
      plugins = [];
      break;
    case 'typescript':
      parser = 'typescript';
      plugins = [typescript, estree];
      break;
  }

  const out = await prettier.format(text, { parser, plugins });

  return out;
}

/**
 * Generate a program from the current {@link CartoKitIR}.
 *
 * @param ir The {@link CartoKitIR}.
 * @param language The language backend to use for code generation.
 * @param library The library backend to use for code generation.
 * @returns A Promise resolving to the current program.
 */
export async function codegen(
  ir: CartoKitIR,
  language: CartoKitBackend['language'],
  library: CartoKitBackend['library']
): Promise<CartokitCodegenFile[]> {
  const analysis = analyzeIR(ir, language, library);

  const index = codegenImports(ir, analysis);
  const html = codegenHTML();
  const css = codegenCSS();

  const files = [
    {
      text: index,
      language,
      name: `index.${language === 'typescript' ? 'ts' : 'js'}`
    },
    { text: html, language: 'html' as const, name: 'index.html' },
    { text: css, language: 'css' as const, name: 'style.css' }
  ];

  return Promise.all(
    files.map(async (file) => ({
      language: file.language,
      name: file.name,
      text: await format(file.text, file.language)
    }))
  );
}
