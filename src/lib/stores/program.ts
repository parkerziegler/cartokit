import type { Map } from 'maplibre-gl';
import { derived, type Writable } from 'svelte/store';

import { codegen } from '$lib/codegen';
import { ir, type CartoKitIR } from '$lib/stores/ir';
import { map } from '$lib/stores/map';

export const program = derived<[Writable<Map>, Writable<CartoKitIR>], string>(
  [map, ir],
  ([$map, $ir], set) => {
    codegen($map, $ir).then(set);
  }
);
