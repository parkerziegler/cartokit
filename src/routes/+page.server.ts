/* eslint-disable import/no-unresolved */
import { VERCEL_ENV } from '$env/static/private';
import { PUBLIC_MAPTILER_API_KEY } from '$env/static/public';
import type { VercelEnv } from '$lib/types';
/* eslint-enable import/no-unresolved */

export function load() {
  return {
    basemap:
      VERCEL_ENV === 'preview'
        ? {
            url: `https://api.maptiler.com/maps/dataviz-light/style.json?key=${PUBLIC_MAPTILER_API_KEY}`,
            provider: 'MapTiler' as const
          }
        : {
            url: 'https://tiles.stadiamaps.com/styles/stamen_toner_lite.json',
            provider: 'Stamen' as const
          },
    env: VERCEL_ENV as VercelEnv
  };
}
