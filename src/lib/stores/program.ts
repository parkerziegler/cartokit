import { derived, type Writable } from 'svelte/store';

import { codegen } from '#lib/codegen/index.ts';
import { backend } from '#lib/stores/backend.ts';
import { ir } from '#lib/stores/ir.ts';
import { type CartoKitIR } from '#lib/types/index.ts';
import {
  type CartoKitBackend,
  type CartokitCodegenProgramFile
} from '#lib/types/codegen.ts';

export const program = derived<
  [Writable<CartoKitIR>, Writable<CartoKitBackend>],
  CartokitCodegenProgramFile[]
>([ir, backend], ([$ir, $backend], set) => {
  codegen($ir, $backend).then(set);
});
