import { backend } from '$lib/state/backend.svelte';
import { ir } from '$lib/state/ir.svelte';

import { codegen } from '$lib/codegen';

const prog = $derived.by(async () => {
  try {
    return await codegen(
      ir.value,
      backend.value.language,
      backend.value.library
    );
  } catch (err) {
    console.error(
      `Code generation failed for backend ${backend.value.language}-${backend.value.library}. Error: ${(err as Error).message}`
    );
    return '';
  }
});

export const program = {
  get value() {
    return prog;
  }
};
