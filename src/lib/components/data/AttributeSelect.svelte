<script lang="ts">
	import Select from '$lib/components/shared/Select.svelte';
	import { dispatchLayerUpdate } from '$lib/interaction/update';
	import { map } from '$lib/stores/map';
	import { selectedLayer } from '$lib/stores/selected-layer';
	import { selectedFeature } from '$lib/stores/feature';
	import { isDataLayer } from '$lib/types/CartoKitLayer';

	$: options = Object.keys($selectedFeature?.properties ?? {}).map((attribute) => ({
		value: attribute,
		label: attribute
	}));
	$: selected = $selectedLayer && isDataLayer($selectedLayer) ? $selectedLayer.attribute : '';

	function onChange(event: CustomEvent<{ value: string }>) {
		const attribute = event.detail.value;

		if ($map && $selectedLayer) {
			dispatchLayerUpdate({
				type: 'attribute',
				map: $map,
				layer: $selectedLayer,
				payload: {
					attribute
				}
			});
		}
	}
</script>

<Select {options} {selected} on:change={onChange} />
