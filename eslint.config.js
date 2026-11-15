import js from '@eslint/js';
import { loadConfig } from '@sveltejs/load-config';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

const svelteConfig = (await loadConfig('./', { traverse: false }))?.config;

export default defineConfig(
  js.configs.recommended,
  ts.configs.recommended,
  ...svelte.configs.recommended,
  prettier,
  ...svelte.configs.prettier,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        __CARTOKIT_VERSION__: 'readonly'
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
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_'
        }
      ]
    }
  },
  {
    ignores: [
      '.github/',
      '.svelte-kit/',
      '.vercel/',
      '.vscode/',
      'assets/',
      'coverage/',
      'node_modules/',
      'playwright-report/',
      'screenshots/',
      'playwright.config.ts'
    ]
  }
);
