import * as prettier from 'prettier';
import babel from 'prettier/plugins/babel';
import estree from 'prettier/plugins/estree';
import html from 'prettier/plugins/html';
import postcss from 'prettier/plugins/postcss';
import typescript from 'prettier/plugins/typescript';

import { analyzeIR } from '#lib/codegen/analysis.ts';
import { codegenCSS } from '#lib/codegen/codegen-css.ts';
import { codegenDB } from '#lib/codegen/codegen-db.ts';
import { codegenHTML } from '#lib/codegen/codegen-html.ts';
import { codegenImports } from '#lib/codegen/codegen-imports.ts';
import { codegenMap } from '#lib/codegen/codegen-map.ts';
import { codegenPackageJson } from '#lib/codegen/codegen-package-json.ts';
import { codegenTsconfigJson } from '#lib/codegen/codegen-tsconfig-json.ts';
import { eraseTypes } from '#lib/codegen/utils.ts';
import type {
  CartoKitBackend,
  CartokitCodegenLanguage,
  CartokitCodegenProgramFile
} from '#lib/types/codegen.ts';
import type { CartoKitIR } from '#lib/types/index.ts';

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
 * @returns A Promise resolving to an Array of {@link CartokitCodegenProgramFile}.
 */
export async function codegen(
  ir: CartoKitIR,
  backend: CartoKitBackend
): Promise<CartokitCodegenProgramFile[]> {
  const analysis = analyzeIR(ir, backend);
  const isTypeScript = analysis.language === 'typescript';

  const index = [codegenImports(analysis), codegenMap(ir, analysis)].join(
    '\n\n'
  );
  const html = codegenHTML(analysis.language);
  const css = codegenCSS(ir);
  const packageJson = codegenPackageJson(analysis);

  const files: CartokitCodegenProgramFile[] = [
    {
      text: index,
      language: analysis.language,
      path: `src/index.${isTypeScript ? 'ts' : 'js'}`
    },
    { text: html, language: 'html' as const, path: 'index.html' },
    { text: css, language: 'css' as const, path: 'src/style.css' },
    { text: packageJson, language: 'json' as const, path: 'package.json' }
  ];

  if (analysis.isDuckDBRequired) {
    files.splice(1, 0, {
      text: codegenDB(),
      language: analysis.language,
      path: `src/db.${isTypeScript ? 'ts' : 'js'}`
    });
  }

  if (isTypeScript) {
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
      // Program files are always generated as TypeScript; erase types for the
      // JavaScript backend.
      text: await format(
        file.language === 'javascript'
          ? await eraseTypes(file.text)
          : file.text,
        file.language
      )
    }))
  );
}
