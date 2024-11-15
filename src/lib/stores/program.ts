import { derived, type Writable } from 'svelte/store';

import { codegen } from '$lib/codegen';
import { ir } from '$lib/stores/ir';
import { type CartoKitIR } from '$lib/types';

export const program = derived<Writable<CartoKitIR>, string>(ir, ($ir, set) => {
  codegen($ir).then(set);
});
