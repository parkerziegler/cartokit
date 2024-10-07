import * as Comlink from 'comlink';

import type { CartoKitMetric } from '$lib/types';

let metrics: CartoKitMetric[] = [];
let isProcessing = false;

/**
 * Flush the existing queue of @see{CartoKitMetric}s to the server.
 */
async function flushMetrics() {
  if (isProcessing || metrics.length === 0) {
    return;
  }

  isProcessing = true;
  const batch = metrics.slice();

  try {
    fetch('/api/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metrics)
    });
    metrics = [];
  } catch (_err) {
    metrics.unshift(...batch);
  } finally {
    isProcessing = false;
  }
}

setInterval(flushMetrics, 10000);

/**
 * Capture a performance metric by pushing it to the metrics queue.
 *
 * @param metric – A @see{CartoKitMetric} to capture.
 */
function captureMetric(metric: CartoKitMetric) {
  metrics.push(metric);
}

Comlink.expose(captureMetric);
