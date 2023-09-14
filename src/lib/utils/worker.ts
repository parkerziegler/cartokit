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
  | { type: 'data'; data: FeatureCollection }
  | { type: 'console'; args: unknown[] }
  | { type: 'error'; error: Error };

/**
 * A function to run a user-defined transformation function in a Web Worker.
 *
 * @param program – The user-defined transformation function.
 * @param featureCollection – The GeoJSON FeatureCollection to transform.
 * @param cb – A callback function to run on success or failure of the
 * transformation.
 */
export function transformationWorker(
  program: string,
  featureCollection: FeatureCollection,
  cb: (message: TransformationWorkerMessage) => void
) {
  const blob = new Blob(
    // Invoke user transformation code using an IIFE.
    // Wrap in a try-catch so we can send errors back to the main thread.
    [
      `(${interceptConsoleInWebWorker.toString()})();
      try {
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
      error: new Error(
        `${event.message}. ${
          event.lineno -
          interceptConsoleInWebWorker.toString().split('\n').length -
          1
        }:${event.colno}.`
      )
    });

    worker.terminate();
    URL.revokeObjectURL(source);
  });
}

/**
 * A function to intercept console.log calls in a Web Worker and send them back
 * to the main thread.
 */
function interceptConsoleInWebWorker(): void {
  const log = console.log.bind(console);
  console.log = (...args) => {
    self.postMessage({ type: 'console', args });
    log(...args);
  };
}
