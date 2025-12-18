import { get } from 'svelte/store';

import { feature } from '$lib/state/feature.svelte';
import { ir } from '$lib/stores/ir';
import type { CartoKitLayer } from '$lib/types';

const lyr = $derived.by<{ value: CartoKitLayer | null }>(() => {
  if (feature.value) {
    const layerId = feature.value.layer.id.replace(/-outlines|-points/g, '');
    return { value: get(ir).layers[layerId] };
  }

  return { value: null };
});

export const layer = {
  get value() {
    return lyr.value;
  }
};
