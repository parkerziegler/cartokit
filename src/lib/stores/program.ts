import { derived } from 'svelte/store';

import { layers } from '$lib/stores/layers';
import { codegen } from '$lib/codegen';

export const program = derived([layers], ([$layers]) => codegen($layers));
