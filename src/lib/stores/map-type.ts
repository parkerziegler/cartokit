import { derived } from 'svelte/store';

import { selectedFeature } from '$lib/stores/selected-feature';
import { ir } from '$lib/stores/ir';
import type { MapType } from '$lib/types/map-types';
import { DEFAULT_MAP_TYPE } from '$lib/utils/constants';

export const mapType = derived<[typeof selectedFeature, typeof ir], MapType>(
  [selectedFeature, ir],
  ([$selectedFeature, $ir]) => {
    if ($selectedFeature) {
      const layer = $selectedFeature.layer.id.endsWith('-outlines')
        ? $ir.layers[$selectedFeature.layer.id.replace('-outlines', '')]
        : $ir.layers[$selectedFeature.layer.id];

      return layer.type;
    }

    return DEFAULT_MAP_TYPE;
  }
);
