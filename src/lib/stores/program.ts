import { derived, type Writable } from 'svelte/store';

import { codegen } from '$lib/codegen';
import { backend } from '$lib/stores/backend';
import { ir } from '$lib/stores/ir';
import { type CartoKitIR } from '$lib/types';
import {
  type CartoKitBackend,
  type CartokitCodegenProgramFile
} from '$lib/types/codegen';

export const program = derived<
  [Writable<CartoKitIR>, Writable<CartoKitBackend>],
  CartokitCodegenProgramFile[]
>([ir, backend], ([$ir, $backend], set) => {
  codegen($ir, $backend).then(set);
});
