import { derived, type Writable } from 'svelte/store';

import { codegen } from '$lib/codegen';
import { backend } from '$lib/stores/backend';
import { ir } from '$lib/stores/ir';
import { type CartoKitBackend, type CartoKitIR } from '$lib/types';

export const program = derived<
  [Writable<CartoKitIR>, Writable<CartoKitBackend>],
  string
>([ir, backend], ([$ir, $backend], set) => {
  codegen($ir, $backend.language, $backend.library).then(set);
});
