import { derived } from 'svelte/store';

import { codegen } from '$lib/codegen';
import { layers } from '$lib/stores/layers';
import { map } from '$lib/stores/map';

export const program = derived([map, layers], ([$map, $layers]) =>
  codegen($map, $layers)
);
