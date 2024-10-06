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
import type { PerformanceMetric } from '$lib/types';

const client = new S3Client({
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: 'auto',
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY
  }
});

export async function POST({ request }): Promise<Response> {
  const metrics = await request.json();
  const existingCodegenMetrics = await fetchExistingMetrics('codegen');
  const Body = JSON.stringify(existingCodegenMetrics.concat(metrics), null, 2);

  await client.send(
    new PutObjectCommand({
      Bucket: 'cartokit',
      Key: 'codegen.json',
      Body,
      ContentType: 'application/json'
    })
  );

  return new Response('Metrics updated.', {
    status: 200
  });
}

async function fetchExistingMetrics(
  kind: PerformanceMetric['kind']
): Promise<PerformanceMetric[]> {
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
