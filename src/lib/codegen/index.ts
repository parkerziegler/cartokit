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
import { codegenPackageJson } from '$lib/codegen/codegen-package-json';
import { codegenTsconfigJson } from '$lib/codegen/codegen-tsconfig-json';
import type { CartoKitIR } from '$lib/types';
import type {
  CartoKitBackend,
  CartokitCodegenFile,
  CartokitCodegenLanguage
} from '$lib/types/codegen';

/**
 * Format cartokit-generated program text.
 *
 * @param text The cartokit-generated program text.
 * @param language The {@link CartokitCodegenLanguage} of cartokit-generated
 * program text.
 * @returns A Prettier-formatted program string.
 */
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
      plugins = [babel, estree];
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
 * @param backend The {@link CartoKitBackend} to use for code generation.
 * @returns A Promise resolving to an Array of {@link CartokitCodegenFile}.
 */
export async function codegen(
  ir: CartoKitIR,
  backend: CartoKitBackend
): Promise<CartokitCodegenFile[]> {
  const analysis = analyzeIR(ir, backend);

  const index = codegenImports(ir, analysis);
  const html = codegenHTML(analysis.language);
  const css = codegenCSS(ir);
  const packageJson = codegenPackageJson(analysis);

  const files = [
    {
      text: index,
      language: analysis.language,
      path: `src/index.${analysis.language === 'typescript' ? 'ts' : 'js'}`
    },
    { text: html, language: 'html' as const, path: 'index.html' },
    { text: css, language: 'css' as const, path: 'src/style.css' },
    { text: packageJson, language: 'json' as const, path: 'package.json' }
  ];

  if (analysis.language === 'typescript') {
    files.push({
      text: codegenTsconfigJson(),
      language: 'json',
      path: 'tsconfig.json'
    });
  }

  return Promise.all(
    files.map(async (file) => ({
      language: file.language,
      path: file.path,
      text: await format(file.text, file.language)
    }))
  );
}
