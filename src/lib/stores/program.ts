import { derived, type Writable } from 'svelte/store';

import { backend } from '$lib/stores/backend';
import { ir } from '$lib/stores/ir';
import { type CartoKitBackend, type CartoKitIR } from '$lib/types';

export const program = derived<
  [Writable<CartoKitIR>, Writable<CartoKitBackend>],
  string
>([ir, backend], ([$ir, $backend], set) => {
  let module;

  switch ($backend) {
    case 'mapbox':
      module = import('$lib/codegen/mapbox/index.js');
      break;
    case 'maplibre':
      module = import('$lib/codegen/maplibre/index.js');
      break;
  }

  module
    .then(({ codegen }) => {
      codegen($ir)
        .then(set)
        .catch((err: Error) => {
          console.error(
            `Code generation failed for backend: ${$backend}. Error: ${err.message}`
          );
        });
    })
    .catch((err: Error) => {
      console.error(
        `Failed to load backend: ${$backend}. Error: ${err.message}`
      );
    });
});
