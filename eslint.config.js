import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

import svelteConfig from './svelte.config.js';

export default ts.config(
  js.configs.recommended,
  ts.configs.recommended,
  ...svelte.configs.recommended,
  prettier,
  ...svelte.configs.prettier,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
        svelteConfig
      }
    }
  },
  {
    ignores: [
      '.github/',
      '.svelte-kit/',
      '.vercel/',
      '.vscode/',
      'assets/',
      'node_modules/',
      'playwright-report/',
      'screenshots/',
      'playwright.config.ts'
    ]
  }
);
