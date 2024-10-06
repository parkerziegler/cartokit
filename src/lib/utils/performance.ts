import * as Comlink from 'comlink';

import type { PerformanceMetric } from '$lib/types';

let metrics: PerformanceMetric[] = [];
let isProcessing = false;

async function flushMetrics() {
  if (isProcessing || metrics.length === 0) {
    return;
  }

  isProcessing = true;
  const batch = metrics.slice();

  try {
    fetch('/performance', {
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

function capturePerformance(metric: PerformanceMetric) {
  metrics.push(metric);
}

setInterval(flushMetrics, 10000);

Comlink.expose(capturePerformance);
