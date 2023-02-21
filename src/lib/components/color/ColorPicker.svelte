<script lang="ts">
	import { map } from '$lib/stores/map';
	import { layers } from '$lib/stores/layers';
	import { selectedLayer } from '$lib/stores/selected-layer';
	import { decimalToPercent, percentToDecimal } from '$lib/utils/color';
	import { dispatchLayerUpdate } from '$lib/interaction/layer';
	import { isFillLayer } from '$lib/types/CartoKitLayer';

	const defaultColor = '#FFFFFF';
	const defaultOpacity = 1;

	$: color = $selectedLayer && isFillLayer($selectedLayer) ? $selectedLayer.fill : defaultColor;
	$: opacity =
		$selectedLayer && isFillLayer($selectedLayer)
			? decimalToPercent($selectedLayer.opacity)
			: decimalToPercent(defaultOpacity);

	const onColorInput = (event: Event) => {
		const target = event.target as HTMLInputElement;

		if ($selectedLayer && $map) {
			dispatchLayerUpdate({
				type: 'fill',
				map: $map,
				layer: $selectedLayer,
				layers: $layers,
				payload: {
					color: target.value
				}
			});
		}
	};

	const onOpacityChange = (event: Event) => {
		const target = event.target as HTMLInputElement;

		if ($selectedLayer && $map) {
			dispatchLayerUpdate({
				type: 'opacity',
				map: $map,
				layer: $selectedLayer,
				layers: $layers,
				payload: {
					opacity: percentToDecimal(Math.min(100, Math.max(0, +target.value)))
				}
			});
		}
	};
</script>

<div class="color-picker flex">
	<div class="stack-h stack-xs font-mono text-xs text-white">
		<input
			type="color"
			class="appearance-none cursor-pointer p-0 h-4 w-4 rounded"
			value={color}
			on:input={onColorInput}
		/>
		<input type="text" class="bg-inherit pl-2" size="7" value={color} />
		<span>
			<input
				type="number"
				class="bg-inherit w-8 text-right"
				min="0"
				max="100"
				value={opacity}
				on:change={onOpacityChange}
			/>
			%
		</span>
	</div>
</div>
