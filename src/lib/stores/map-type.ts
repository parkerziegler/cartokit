import { derived } from 'svelte/store';

import { selectedFeature } from '$lib/stores/feature';
import { layers } from '$lib/stores/layers';
import type { MapType } from '$lib/types/MapTypes';

const DEFAULT_MAP_TYPE = 'Fill';

export const mapType = derived<[typeof selectedFeature, typeof layers], MapType>(
	[selectedFeature, layers],
	([$selectedFeature, $layers]) => {
		if ($selectedFeature) {
			const layer = $layers.find((layer) => layer.id === $selectedFeature.layer.id);

			return layer?.type ?? DEFAULT_MAP_TYPE;
		}

		return DEFAULT_MAP_TYPE;
	}
);
