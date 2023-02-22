<script lang="ts">
	import { map } from '$lib/stores/map';
	import { layers } from '$lib/stores/layers';
	import { selectedLayer } from '$lib/stores/selected-layer';
	import Select from '$lib/components/shared/Select.svelte';
	import { COLOR_SCALES, type ColorScale } from '$lib/types/ColorScales';
	import { isChoroplethLayer } from '$lib/types/CartoKitLayer';
	import { dispatchLayerUpdate } from '$lib/interaction/layer';

	const selected =
		$selectedLayer && isChoroplethLayer($selectedLayer)
			? $selectedLayer.breaks.scale
			: COLOR_SCALES[0];

	function onChange(event: CustomEvent<{ value: ColorScale }>) {
		if ($map && $selectedLayer) {
			dispatchLayerUpdate({
				type: 'color-scale-type',
				map: $map,
				layer: $selectedLayer,
				layers: $layers,
				payload: {
					scale: event.detail.value
				}
			});
		}
	}
</script>

<Select options={[...COLOR_SCALES]} {selected} on:change={onChange} />
