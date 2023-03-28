import { derived } from 'svelte/store';

import { layers } from '$lib/stores/layers';
import { selectedFeature } from '$lib/stores/selected-feature';
import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

export const selectedLayer = derived<
  [typeof selectedFeature, typeof layers],
  CartoKitLayer | null
>([selectedFeature, layers], ([$selectedFeature, $layers]) => {
  if ($selectedFeature) {
    return $selectedFeature.layer.id.endsWith('-outlines')
      ? $layers[$selectedFeature.layer.id.replace('-outlines', '')]
      : $layers[$selectedFeature.layer.id];
  }

  return null;
});
