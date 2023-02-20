<script lang="ts">
	import { map } from '$lib/stores/map';
	import { layers } from '$lib/stores/layers';
	import { selectedLayer } from '$lib/stores/selected-layer';
	import Select from '$lib/components/shared/Select.svelte';
	import { COLOR_SCALES, type ColorScales } from '$lib/types/ColorScales';
	import { isChoroplethLayer } from '$lib/types/CartoKitLayer';
	import { deriveColorScale } from '$lib/interaction/color';

	const selected = isChoroplethLayer($selectedLayer)
		? $selectedLayer.breaks.scale
		: COLOR_SCALES[0];

	function onChange(event: CustomEvent<{ value: ColorScales }>) {
		layers.update((ls) => {
			const layer = ls.find((l) => l.id === $selectedLayer.id);

			if (layer && isChoroplethLayer(layer)) {
				layer.breaks.scale = event.detail.value;
				$map?.setPaintProperty(
					layer.id,
					'fill-color',
					deriveColorScale(layer, $map.querySourceFeatures(layer.id))
				);
			}

			return ls;
		});
	}
</script>

<Select options={[...COLOR_SCALES]} {selected} on:change={onChange} />
