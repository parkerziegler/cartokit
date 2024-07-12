import starlightPlugin from '@astrojs/starlight-tailwind';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#f3f0ff',
          100: '#ebe5ff',
          200: '#d4d7ff',
          300: '#d0adff',
          400: '#a98fff',
          500: '#9575ff',
          600: '#7e58ff',
          700: '#3d00ff',
          800: '#2800ad',
          900: '#140057',
          950: '#0a0029'
        }
      }
    }
  },
  plugins: [starlightPlugin()]
};
