import { VERCEL_ENV } from '$env/static/private';
import { connectToMongoDB } from '$lib/db';

export async function load({ url }) {
  // const db = connectToMongoDB();
  // const collection = db.collection('users');

  // Check if the userId exists in the database.
  // const userId = url.searchParams.get('userId');
  // const user = await collection.findOne({ id: userId });

  // Check for the LLM enabled flag.
  const llmEnabled = url.searchParams.get('llm') === '1';

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
    userId: null,
    enableChat: false
  };
}
