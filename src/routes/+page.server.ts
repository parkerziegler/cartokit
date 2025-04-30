import { VERCEL_ENV } from '$env/static/private';
import { PUBLIC_MAPTILER_API_KEY } from '$env/static/public';
import { connectToMongoDB } from '$lib/db';

export async function load({ url }) {
  const db = connectToMongoDB();
  const collection = db.collection('users');

  // Check if the userId exists in the database.
  const userId = url.searchParams.get('userId');
  const user = await collection.findOne({ id: userId });

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
    userId,
    enableChat: !!user
  };
}
