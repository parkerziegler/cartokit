<script lang="ts">
	import { map } from '$lib/stores/map';
	import { mapType } from '$lib/stores/map-type';
	import { selectedLayer } from '$lib/stores/selected-layer';
	import { layers } from '$lib/stores/layers';
	import { MAP_TYPES, type MapType } from '$lib/types/MapTypes';
	import Select from '$lib/components/shared/Select.svelte';
	import { dispatchLayerUpdate } from '$lib/interaction/layer';

	const options = MAP_TYPES.map((mapType) => ({
		value: mapType,
		label: mapType
	}));

	function onChange(event: CustomEvent<{ value: MapType }>) {
		if ($map && $selectedLayer) {
			dispatchLayerUpdate({
				type: 'map-type',
				map: $map,
				layer: $selectedLayer,
				payload: { mapType: event.detail.value },
				layers: $layers
			});
		}
	}
</script>

<Select {options} selected={$mapType} on:change={onChange} />
