import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
  VERCEL_ENV: { static: true },
  CLOUDFLARE_API_TOKEN: { static: true },
  CLOUDFLARE_ACCOUNT_ID: { static: true },
  KV_NAMESPACE_ID: { static: true },
  OPENAI_API_KEY: { static: true },
  PUBLIC_MAPTILER_API_KEY: { public: true, static: true }
});
