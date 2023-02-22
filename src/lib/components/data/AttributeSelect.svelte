<script lang="ts">
	import Select from '$lib/components/shared/Select.svelte';
	import { layers } from '$lib/stores/layers';
	import { isChoroplethLayer } from '$lib/types/CartoKitLayer';
	import { map } from '$lib/stores/map';
	import { dispatchLayerUpdate } from '$lib/interaction/layer';
	import { selectedLayer } from '$lib/stores/selected-layer';
	import { selectedFeature } from '$lib/stores/feature';

	const options = Object.keys($selectedFeature?.properties ?? {}).map((attribute) => ({
		value: attribute,
		label: attribute
	}));
	const selected =
		$selectedLayer && isChoroplethLayer($selectedLayer) ? $selectedLayer.attribute : '';

	function onChange(event: CustomEvent<{ value: string }>) {
		const attribute = event.detail.value;

		if ($map && $selectedLayer) {
			dispatchLayerUpdate({
				type: 'attribute',
				map: $map,
				layer: $selectedLayer,
				layers: $layers,
				payload: {
					attribute
				}
			});
		}
	}
</script>

<Select {options} {selected} on:change={onChange} />
