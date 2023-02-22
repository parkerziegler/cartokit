<script lang="ts">
	import ColorScaleSelect from '$lib/components/color/ColorScaleSelect.svelte';
	import ColorStopsSelect from '$lib/components/color/ColorStopsSelect.svelte';
	import { map } from '$lib/stores/map';
	import { layers } from '$lib/stores/layers';
	import { selectedLayer } from '$lib/stores/selected-layer';
	import { dispatchLayerUpdate } from '$lib/interaction/layer';
	import { percentToDecimal, decimalToPercent } from '$lib/utils/color';
	import { isChoroplethLayer } from '$lib/types/CartoKitLayer';

	let selectedColor: string = '#FFFFFF';
	const defaultColors = ['#feedde', '#fdbe85', '#fd8d3c', '#e6550d', '#a63603'];
	const defaultOpacity = 1;

	$: colors =
		$selectedLayer && isChoroplethLayer($selectedLayer)
			? $selectedLayer.style.breaks.colors
			: defaultColors;
	$: opacity = $selectedLayer
		? decimalToPercent($selectedLayer.style.opacity)
		: decimalToPercent(defaultOpacity);

	function onColorInput(event: Event, i: number) {
		const target = event.target as HTMLInputElement;

		if ($selectedLayer && $map) {
			dispatchLayerUpdate({
				type: 'color-palette-color',
				map: $map,
				layer: $selectedLayer,
				layers: $layers,
				payload: {
					color: target.value,
					index: i
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
				layers: $layers,
				payload: {
					opacity: percentToDecimal(Math.min(100, Math.max(0, +target.value)))
				}
			});
		}
	}
</script>

<div class="font-mono text-xs text-white stack stack-xs">
	<div class="stack-h stack-xs">
		<ColorScaleSelect />
		<ColorStopsSelect />
	</div>
	<div class="stack-h stack-xs">
		<ul class="color-palette flex">
			{#each colors as color, i}
				<li>
					<input
						type="color"
						class="appearance-none cursor-pointer bg-transparent p-0 h-4 w-4"
						value={color}
						on:input={(event) => onColorInput(event, i)}
					/>
				</li>
			{/each}
		</ul>
		<input class="bg-inherit pl-2" size="7" bind:value={selectedColor} />
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
