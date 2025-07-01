import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const config: UserConfig = {
  plugins: [tailwindcss(), sveltekit()]
};

export default config;
