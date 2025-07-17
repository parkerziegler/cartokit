import { derived } from 'svelte/store';

import { ir } from '$lib/stores/ir';
import { selectedFeature } from '$lib/stores/selected-feature';
import type { CartoKitLayer } from '$lib/types';

export const selectedLayer = derived<
  [typeof selectedFeature, typeof ir],
  CartoKitLayer | null
>([selectedFeature, ir], ([$selectedFeature, $ir]) => {
  if ($selectedFeature) {
    if ($selectedFeature.layer.id.endsWith('-outlines')) {
      return $ir.layers[$selectedFeature.layer.id.replace('-outlines', '')];
    } else if ($selectedFeature.layer.id.endsWith('-points')) {
      return $ir.layers[$selectedFeature.layer.id.replace('-points', '')];
    }

    return $ir.layers[$selectedFeature.layer.id];
  }

  return null;
});
