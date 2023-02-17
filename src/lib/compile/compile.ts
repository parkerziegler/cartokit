import type { Map } from 'mapbox-gl';
import prettier from 'prettier/standalone';
import babylon from 'prettier/parser-babel';

import type { CartoKitLayer } from '$lib/types/CartoKitLayer';
import { compileMap } from '$lib/compile/compile-map';

export const compile = (map: Map, layers: CartoKitLayer[]) => {
	const compiled = compileMap(map, layers);
	const formatted = prettier.format(compiled, {
		parser: 'babel',
		plugins: [babylon]
	});

	return formatted;
};
