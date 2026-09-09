import { derived, type Writable } from 'svelte/store';

import { codegen } from '$lib/codegen';
import { backend } from '$lib/stores/backend';
import { ir } from '$lib/stores/ir';
import { type CartoKitIR } from '$lib/types';
import {
  type CartoKitBackend,
  type CartokitCodegenFile
} from '$lib/types/codegen';

export const program = derived<
  [Writable<CartoKitIR>, Writable<CartoKitBackend>],
  CartokitCodegenFile[]
>([ir, backend], ([$ir, $backend], set) => {
  codegen($ir, $backend.language, $backend.library).then(set);
});
