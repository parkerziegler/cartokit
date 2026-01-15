import type { FeatureCollection } from 'geojson';

import { normalizeGeoJSONToFeatureCollection } from '$lib/utils/geojson';

/**
 * A generic function to fetch arbitrary GeoJSON from a url.
 *
 * @param url — The url to fetch a GeoJSON dataset from.
 */
export async function fetchGeoJSON(url: string): Promise<FeatureCollection> {
  try {
    const response = await fetch(url);
    const data = await response.json();

    return normalizeGeoJSONToFeatureCollection(data);
  } catch {
    throw new Error('Failed to fetch GeoJSON at: ' + url);
  }
}
