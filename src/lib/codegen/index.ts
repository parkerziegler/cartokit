import * as Comlink from 'comlink';
import * as prettier from 'prettier';
import babel from 'prettier/plugins/babel';
// eslint-disable-next-line import/default
import estree from 'prettier/plugins/estree';

import { codegenImports } from '$lib/codegen/codegen-imports';
import type { CartoKitIR, CartoKitMetric, VercelEnv } from '$lib/types';

const performanceWorker = new Worker(
  new URL('$lib/utils/performance.ts', import.meta.url),
  { type: 'module' }
);
const captureMetric =
  Comlink.wrap<(metric: CartoKitMetric) => void>(performanceWorker);

const newlineRegex = /\r\n|\r|\n/;

/**
 * Generate a Mapbox GL JS program from the CartoKit IR.
 *
 * @param ir – The CartoKit IR.
 * @param vercelEnv – The Vercel environment.
 * @param playwrightWorkflowId – The Playwright workflow ID for capturing per-
 * formance metrics, if defined.
 * @returns – A Mapbox GL JS program.
 */
export async function codegen(
  ir: CartoKitIR,
  vercelEnv: VercelEnv,
  playwrightWorkflowId = 'production'
): Promise<string> {
  if (vercelEnv !== 'development') {
    performance.mark('codegen-start');
  }

  const program = codegenImports(ir);
  const formatted = await prettier.format(program, {
    parser: 'babel',
    plugins: [babel, estree]
  });

  if (vercelEnv !== 'development') {
    performance.mark('codegen-end');
    const { duration } = performance.measure(
      'codegen',
      'codegen-start',
      'codegen-end'
    );

    captureMetric({
      kind: 'codegen',
      duration,
      timestamp: Date.now(),
      playwrightWorkflowId: playwrightWorkflowId ?? 'production',
      loc: formatted.split(newlineRegex).length
    });
  }

  return formatted;
}

Comlink.expose(codegen);
