import type { GeoJSON, FeatureCollection, Feature } from 'geojson';

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
  const blob = new Blob(
    [fetchGeoJSON.toString(), `${fetchGeoJSON.name}("${url}")`],
    {
      type: 'text/javascript'
    }
  );
  const source = URL.createObjectURL(blob);
  const worker = new Worker(source);

  worker.addEventListener('message', (event: MessageEvent<GeoJSON>) => {
    const featureCollection = normalizeGeoJSONToFeatureCollection(event.data);
    cb(featureCollection);

    worker.terminate();
    URL.revokeObjectURL(source);
  });
}

type TransformationWorkerMessage =
  | { type: 'data'; data: Feature[] }
  | { type: 'error'; error: Error };

export function transformationWorker(
  program: string,
  featureCollection: Feature[],
  cb: (data: TransformationWorkerMessage) => void
) {
  const blob = new Blob(
    // Invoke user transformation code using an IIFE.
    [
      `try {
        const data = (${program})(${JSON.stringify(featureCollection)});
        self.postMessage({ type: 'data', data });
      } catch (error) {
        self.postMessage({ type: 'error', error });
      }`
    ],
    { type: 'text/javascript' }
  );

  const source = URL.createObjectURL(blob);
  const worker = new Worker(source);

  worker.addEventListener(
    'message',
    (event: MessageEvent<TransformationWorkerMessage>) => {
      cb(event.data);

      worker.terminate();
      URL.revokeObjectURL(source);
    }
  );

  worker.addEventListener('error', (event: ErrorEvent) => {
    cb({
      type: 'error',
      error: new Error(`${event.message}. ${event.lineno}:${event.colno}.`)
    });

    worker.terminate();
    URL.revokeObjectURL(source);
  });
}
