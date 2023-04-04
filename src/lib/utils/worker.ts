import type { GeoJSON, FeatureCollection } from 'geojson';
import { normalizeGeoJSONToFeatureCollection } from './geojson';

/**
 * A generic function to fetch arbitrary GeoJSON from a url.
 *
 * @param url — The url to fetch a GeoJSON dataset from.
 */
async function fetchGeoJSON(url: string): Promise<void> {
  try {
    const response = await fetch(url);
    const data = await response.json();
    self.postMessage(data);
  } catch {
    throw new Error('Failed to fetch GeoJSON at: ' + url);
  }
}

/**
 * A function to fetch GeoJSON from a url in a Web Worker.
 *
 * @param url – The url to fetch a GeoJSON dataset from.
 * @param cb – A callback function to run when the GeoJSON is fetched.
 */
export function sourceWorker(
  url: string,
  cb: (data: FeatureCollection) => void
) {
  const blob = new Blob([fetchGeoJSON.toString(), `fetchGeoJSON("${url}")`], {
    type: 'text/javascript'
  });
  const source = URL.createObjectURL(blob);
  const worker = new Worker(source);

  worker.addEventListener('message', (event: MessageEvent<GeoJSON>) => {
    const featureCollection = normalizeGeoJSONToFeatureCollection(event.data);
    cb(featureCollection);

    worker.terminate();
    URL.revokeObjectURL(source);
  });
}
