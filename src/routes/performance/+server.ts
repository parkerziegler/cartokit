import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand
} from '@aws-sdk/client-s3';

import {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY
  // eslint-disable-next-line import/no-unresolved
} from '$env/static/private';
import type { CartoKitMetric } from '$lib/types';

const client = new S3Client({
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: 'auto',
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY
  }
});

/**
 * Capture cartokit metrics and store them in S3 (Cloudflare R2).
 *
 * @param params – The request parameters.
 * @param params.request – The request, containing the metrics to store.
 * @returns – A 204 No Content response.
 */
export async function POST({ request }): Promise<Response> {
  const metrics = (await request.json()) as CartoKitMetric[];
  const codegenMetrics = metrics.filter((metric) => metric.kind === 'codegen');
  const reconciliationMetrics = metrics.filter(
    (metric) => metric.kind === 'reconciliation'
  );

  const existingCodegenMetrics = await fetchExistingMetrics('codegen');
  const existingReconciliationMetrics =
    await fetchExistingMetrics('reconciliation');

  await client.send(
    new PutObjectCommand({
      Bucket: 'cartokit',
      Key: 'codegen.json',
      Body: JSON.stringify(
        existingCodegenMetrics.concat(codegenMetrics),
        null,
        2
      ),
      ContentType: 'application/json'
    })
  );

  await client.send(
    new PutObjectCommand({
      Bucket: 'cartokit',
      Key: 'reconciliation.json',
      Body: JSON.stringify(
        existingReconciliationMetrics.concat(reconciliationMetrics),
        null,
        2
      ),
      ContentType: 'application/json'
    })
  );

  return new Response(null, {
    status: 204
  });
}

/**
 * Fetch existing metrics from S3.
 *
 * @param kind – The kind of metric to fetch (e.g., "codegen", "reconciliation",
 * etc.).
 * @returns – An array of existing metrics for the requested metric kind.
 */
async function fetchExistingMetrics(
  kind: CartoKitMetric['kind']
): Promise<CartoKitMetric[]> {
  try {
    const command = new GetObjectCommand({
      Bucket: 'cartokit',
      Key: `${kind}.json`
    });

    const response = await client.send(command);
    const contents = await response.Body?.transformToString();

    return contents ? JSON.parse(contents) : [];
  } catch (_err) {
    return [];
  }
}
