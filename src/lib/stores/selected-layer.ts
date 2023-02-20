import { derived } from 'svelte/store';

import { selectedFeature } from '$lib/stores/feature';
import { layers } from '$lib/stores/layers';
import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

export const selectedLayer = derived<[typeof selectedFeature, typeof layers], CartoKitLayer>(
	[selectedFeature, layers],
	([$selectedFeature, $layers]) => {
		return $layers.find((layer) => layer.id === $selectedFeature?.layer.id) ?? $layers[0];
	}
);
