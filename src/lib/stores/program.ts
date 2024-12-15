import { derived, type Writable } from 'svelte/store';

import { backend } from '$lib/stores/backend';
import { ir } from '$lib/stores/ir';
import { type CartoKitBackend, type CartoKitIR } from '$lib/types';

export const program = derived<
  [Writable<CartoKitIR>, Writable<CartoKitBackend>],
  string
>([ir, backend], ([$ir, $backend], set) => {
  let module;

  switch ($backend.library) {
    case 'mapbox': {
      switch ($backend.language) {
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
      switch ($backend.language) {
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

  module
    .then(({ codegen }) => {
      codegen($ir)
        .then(set)
        .catch((err: Error) => {
          console.error(
            `Code generation failed for backend ${$backend.language}-${$backend.library}. Error: ${err.message}`
          );
        });
    })
    .catch((err: Error) => {
      console.error(
        `Failed to load backend ${$backend.language}-${$backend.library}. Error: ${err.message}`
      );
    });
});
