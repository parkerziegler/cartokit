import { enhancedImages } from '@sveltejs/enhanced-img';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import type { UserConfig } from 'vite';
import { defineConfig } from 'vitest/config';

const config: UserConfig = defineConfig({
  plugins: [tailwindcss(), enhancedImages(), sveltekit()],
  resolve: process.env.VITEST
    ? {
        conditions: ['browser']
      }
    : undefined,
  test: {
    include: ['src/lib/**/*.spec.ts']
  }
});

export default config;
