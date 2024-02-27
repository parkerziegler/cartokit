import type { Map } from 'maplibre-gl';
import * as prettier from 'prettier';
import babel from 'prettier/plugins/babel';
// eslint-disable-next-line import/default
import estree from 'prettier/plugins/estree';

import { codegenImports } from '$lib/codegen/codegen-imports';
import type { CartoKitIR } from '$lib/stores/ir';

/**
 * Generate a Mapbox GL JS program from the CartoKit IR.
 *
 * @param map – The MapLibre GL JS map instance.
 * @param ir – The CartoKit IR.
 *
 * @returns – A Mapbox GL JS program.
 */
export async function codegen(map: Map, ir: CartoKitIR): Promise<string> {
  const program = codegenImports(map, ir);
  const formatted = await prettier.format(program, {
    parser: 'babel',
    plugins: [babel, estree]
  });

  return formatted;
}
