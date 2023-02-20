<script lang="ts">
	import { map } from '$lib/stores/map';
	import { mapType } from '$lib/stores/map-type';
	import { layers } from '$lib/stores/layers';
	import { selectedFeature } from '$lib/stores/feature';
	import { MAP_TYPES, type MapType } from '$lib/types/MapTypes';
	import Select from '$lib/components/shared/Select.svelte';
	import { transitionMapType } from '$lib/interaction/map-type';

	function onChange(event: CustomEvent<{ value: MapType }>) {
		layers.update((ls) => {
			const i = ls.findIndex((l) => l.id === $selectedFeature?.layer.id);
			let layer = ls[i];

			if (i !== -1 && $map) {
				layer = transitionMapType({ map: $map, layer: ls[i], targetMapType: event.detail.value });
			}

			return [...ls.slice(0, i), layer, ...ls.slice(i + 1)];
		});
	}
</script>

<Select options={[...MAP_TYPES]} selected={$mapType} on:change={onChange} disabled={!$mapType} />
