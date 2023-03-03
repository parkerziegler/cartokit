import prettier from 'prettier/standalone';
import babylon from 'prettier/parser-babel';

import { compileMap } from '$lib/compile/compile-map';
import type { CartoKitIR } from '$lib/stores/layers';

/**
 * Compile the CartoKit layer IR into a Mapbox GL JS program.
 *
 * @param map – the Mapbox GL JS map instance.
 * @param layers – the CartoKit IR.
 *
 * @returns – a Mapbox GL JS program.
 */
export const compile = (layers: CartoKitIR) => {
	const compiled = compileMap(layers);
	const formatted = prettier.format(compiled, {
		parser: 'babel',
		plugins: [babylon]
	});

	return formatted;
};
