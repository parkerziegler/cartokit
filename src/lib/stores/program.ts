import { derived } from 'svelte/store';

import { map } from '$lib/stores/map';
import { layers } from '$lib/stores/layers';
import { compile } from '$lib/compile/compile';

export const program = derived([map, layers], ([$map, $layers]) => {
	if ($map) {
		return compile($map, $layers);
	}

	return '';
});
