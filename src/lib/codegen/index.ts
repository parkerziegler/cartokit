import prettier from 'prettier/standalone';
import babylon from 'prettier/parser-babel';

import { codegenMap } from '$lib/codegen/codegen-map';
import type { CartoKitIR } from '$lib/stores/layers';

/**
 * Generate a Mapbox GL JS program from the CartoKit IR.
 *
 * @param map – the Mapbox GL JS map instance.
 * @param layers – the CartoKit IR.
 *
 * @returns – a Mapbox GL JS program.
 */
export function codegen(layers: CartoKitIR): string {
	const compiled = codegenMap(layers);
	const formatted = prettier.format(compiled, {
		parser: 'babel',
		plugins: [babylon]
	});

	return formatted;
}
