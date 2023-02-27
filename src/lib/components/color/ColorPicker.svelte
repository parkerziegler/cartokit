<script lang="ts">
	import * as d3 from 'd3';

	import HexInput from '$lib/components/color/HexInput.svelte';
	import { dispatchLayerUpdate } from '$lib/interaction/update';
	import { map } from '$lib/stores/map';
	import { selectedLayer } from '$lib/stores/selected-layer';
	import { isFillLayer } from '$lib/types/CartoKitLayer';
	import { decimalToPercent, percentToDecimal } from '$lib/utils/color';
	import { DEFAULT_FILL, DEFAULT_OPACITY } from '$lib/utils/constants';

	$: color =
		$selectedLayer && isFillLayer($selectedLayer)
			? d3.color($selectedLayer.style.fill)?.formatHex() ?? DEFAULT_FILL
			: DEFAULT_FILL;
	$: opacity = $selectedLayer
		? decimalToPercent($selectedLayer.style.opacity)
		: decimalToPercent(DEFAULT_OPACITY);

	function onColorInput(event: Event) {
		const target = event.target as HTMLInputElement;

		if ($selectedLayer && $map) {
			dispatchLayerUpdate({
				type: 'fill',
				map: $map,
				layer: $selectedLayer,
				payload: {
					color: target.value
				}
			});
		}
	}

	function onHexChange(hex: string) {
		if ($selectedLayer && $map) {
			dispatchLayerUpdate({
				type: 'fill',
				map: $map,
				layer: $selectedLayer,
				payload: {
					color: hex
				}
			});
		}
	}

	function onOpacityChange(event: Event) {
		const target = event.target as HTMLInputElement;

		if ($selectedLayer && $map) {
			dispatchLayerUpdate({
				type: 'opacity',
				map: $map,
				layer: $selectedLayer,
				payload: {
					opacity: percentToDecimal(Math.min(100, Math.max(0, +target.value)))
				}
			});
		}
	}
</script>

<div class="flex color-picker">
	<div class="stack-h stack-h-xs items-center">
		<input
			type="color"
			class="appearance-none cursor-pointer h-4 w-4 rounded"
			value={color}
			on:input={onColorInput}
		/>
		<HexInput hex={color} {onHexChange} {opacity} {onOpacityChange} />
	</div>
</div>
