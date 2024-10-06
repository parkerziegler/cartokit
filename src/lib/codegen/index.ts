import * as Comlink from 'comlink';
import * as prettier from 'prettier';
import babel from 'prettier/plugins/babel';
// eslint-disable-next-line import/default
import estree from 'prettier/plugins/estree';

import { codegenImports } from '$lib/codegen/codegen-imports';
import type { CartoKitIR } from '$lib/stores/ir';
import type { PerformanceMetric, VercelEnv } from '$lib/types';

const performanceWorker = new Worker(
  new URL('$lib/utils/performance.ts', import.meta.url),
  { type: 'module' }
);

/**
 * Generate a Mapbox GL JS program from the CartoKit IR.
 *
 * @param ir – The CartoKit IR.
 * @returns – A Mapbox GL JS program.
 */
export async function codegen(ir: CartoKitIR, env: VercelEnv): Promise<string> {
  if (env !== 'development') {
    performance.mark('codegen-start');
  }

  const program = codegenImports(ir);
  const formatted = await prettier.format(program, {
    parser: 'babel',
    plugins: [babel, estree]
  });

  if (env !== 'development') {
    performance.mark('codegen-end');
    const { duration } = performance.measure(
      'codegen',
      'codegen-start',
      'codegen-end'
    );

    const capturePerformance =
      Comlink.wrap<(metric: PerformanceMetric) => void>(performanceWorker);
    capturePerformance({
      kind: 'codegen',
      duration,
      timestamp: Date.now()
    });
  }

  return formatted;
}

Comlink.expose(codegen);
