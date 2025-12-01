import { backend } from '$lib/state/backend.svelte';
import { ir } from '$lib/state/ir.svelte';

const prog = $derived.by<Promise<{ value: string }>>(async () => {
  let module;

  switch (backend.value.library) {
    case 'mapbox': {
      switch (backend.value.language) {
        case 'typescript': {
          module = import('$lib/codegen/mapbox/typescript/index.js');
          break;
        }
        case 'javascript': {
          module = import('$lib/codegen/mapbox/javascript/index.js');
          break;
        }
      }
      break;
    }
    case 'maplibre': {
      switch (backend.value.language) {
        case 'typescript': {
          module = import('$lib/codegen/maplibre/typescript/index.js');
          break;
        }
        case 'javascript': {
          module = import('$lib/codegen/maplibre/javascript/index.js');
          break;
        }
      }
      break;
    }
  }

  let program: string;
  try {
    const { codegen } = await module;
    try {
      program = await codegen(ir.value);
    } catch (err) {
      console.error(
        `Code generation failed for backend ${backend.value.language}-${backend.value.library}. Error: ${(err as Error).message}`
      );
      program = '';
    }
  } catch (err) {
    console.error(
      `Failed to load backend ${backend.value.language}-${backend.value.library}. Error: ${(err as Error).message}`
    );
    program = '';
  }

  return { value: program };
});

export const program = {
  get value() {
    return prog;
  }
};
