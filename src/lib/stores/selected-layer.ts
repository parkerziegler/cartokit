import { derived } from 'svelte/store';

import { ir } from '$lib/stores/ir';
import { selectedFeature } from '$lib/stores/selected-feature';
import type { CartoKitLayer } from '$lib/types';

export const selectedLayer = derived<
  [typeof selectedFeature, typeof ir],
  CartoKitLayer | null
>([selectedFeature, ir], ([$selectedFeature, $ir]) => {
  if ($selectedFeature) {
    return $selectedFeature.layer.id.endsWith('-outlines')
      ? $ir.layers[$selectedFeature.layer.id.replace('-outlines', '')]
      : $ir.layers[$selectedFeature.layer.id];
  }

  return null;
});
