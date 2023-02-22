<script lang="ts">
	import Select from '$lib/components/shared/Select.svelte';
	import { map } from '$lib/stores/map';
	import { layers } from '$lib/stores/layers';
	import { selectedLayer } from '$lib/stores/selected-layer';
	import { isChoroplethLayer } from '$lib/types/CartoKitLayer';
	import { dispatchLayerUpdate } from '$lib/interaction/layer';

	const selected =
		$selectedLayer && isChoroplethLayer($selectedLayer)
			? $selectedLayer.style.breaks.colors.length
			: 3;
	const options = new Array(9).fill(undefined).map((_, i) => ({
		value: i + 3,
		label: `${i + 3}`
	}));

	function onChange(event: CustomEvent<{ value: number }>) {
		if ($map && $selectedLayer) {
			dispatchLayerUpdate({
				type: 'color-palette-stops',
				map: $map,
				layer: $selectedLayer,
				layers: $layers,
				payload: {
					count: event.detail.value
				}
			});
		}
	}
</script>

<Select {options} {selected} on:change={onChange} />
