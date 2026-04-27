import {
  VERCEL_ENV,
  CLOUDFLARE_API_TOKEN,
  CLOUDFLARE_ACCOUNT_ID,
  KV_NAMESPACE_ID
} from '$env/static/private';
import Cloudflare from 'cloudflare';

const client = new Cloudflare({ apiToken: CLOUDFLARE_API_TOKEN });

export async function load({ url }) {
  const userId = url.searchParams.get('userId');
  const llmEnabled = url.searchParams.get('llm') === '1';

  let userExists = false;

  if (userId) {
    try {
      await client.kv.namespaces.values.get(KV_NAMESPACE_ID, userId, {
        account_id: CLOUDFLARE_ACCOUNT_ID
      });
      userExists = true;
    } catch {
      userExists = false;
    }
  }

  return {
    basemap:
      VERCEL_ENV === 'preview'
        ? {
            url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
            provider: 'CARTO' as const
          }
        : {
            url: 'https://tiles.stadiamaps.com/styles/stamen_toner_lite.json',
            provider: 'Stamen' as const
          },
    userId,
    enableChat: userExists && llmEnabled
  };
}
