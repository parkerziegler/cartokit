import { derived } from 'svelte/store';

import { codegen } from '$lib/codegen';
import { ir } from '$lib/stores/ir';
import { map } from '$lib/stores/map';

export const program = derived([map, ir], ([$map, $ir]) => codegen($map, $ir));
