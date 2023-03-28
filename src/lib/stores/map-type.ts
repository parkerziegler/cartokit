import { derived } from 'svelte/store';

import { selectedFeature } from '$lib/stores/selected-feature';
import { layers } from '$lib/stores/layers';
import type { MapType } from '$lib/types/MapTypes';

const DEFAULT_MAP_TYPE = 'Fill';

export const mapType = derived<
  [typeof selectedFeature, typeof layers],
  MapType
>([selectedFeature, layers], ([$selectedFeature, $layers]) => {
  if ($selectedFeature) {
    const layer = $selectedFeature.layer.id.endsWith('-outlines')
      ? $layers[$selectedFeature.layer.id.replace('-outlines', '')]
      : $layers[$selectedFeature.layer.id];

    return layer.type;
  }

  return DEFAULT_MAP_TYPE;
});
