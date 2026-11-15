import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import type { UserConfig } from 'vite';
import { defineConfig } from 'vitest/config';

const config: UserConfig = defineConfig({
  define: {
    __CARTOKIT_VERSION__: JSON.stringify(process.env.npm_package_version)
  },
  plugins: [
    tailwindcss(),
    enhancedImages(),
    sveltekit({
      // Consult https://kit.svelte.dev/docs/integrations#preprocessors
      // for more information about preprocessors
      preprocess: vitePreprocess(),
      adapter: adapter()
    })
  ],
  resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,
  test: { include: ['src/lib/**/*.spec.ts'] }
});

export default config;
