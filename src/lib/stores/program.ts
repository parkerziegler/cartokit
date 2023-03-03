import { derived } from 'svelte/store';

import { layers } from '$lib/stores/layers';
import { compile } from '$lib/compile/compile';

export const program = derived([layers], ([$layers]) => compile($layers));
