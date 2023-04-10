import type { Map } from 'maplibre-gl';
import prettier from 'prettier/standalone';
import babylon from 'prettier/parser-babel';

import { codegenImports } from '$lib/codegen/codegen-imports';
import type { CartoKitIR } from '$lib/stores/layers';

/**
 * Generate a Mapbox GL JS program from the CartoKit IR.
 *
 * @param map – The MapLibre GL JS map instance.
 * @param layers – The CartoKit IR.
 *
 * @returns – A Mapbox GL JS program.
 */
export function codegen(map: Map, layers: CartoKitIR): string {
  const program = codegenImports(map, layers);
  const formatted = prettier.format(program, {
    parser: 'babel',
    plugins: [babylon]
  });

  return formatted;
}
