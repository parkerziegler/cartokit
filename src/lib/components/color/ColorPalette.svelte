<script lang="ts">
	import * as d3 from 'd3';

	import ColorScaleSelect from '$lib/components/color/ColorScaleSelect.svelte';
	import ColorStopsSelect from '$lib/components/color/ColorStopsSelect.svelte';
	import { map } from '$lib/stores/map';
	import { layers } from '$lib/stores/layers';
	import { selectedLayer } from '$lib/stores/selected-layer';
	import { selectedFeature } from '$lib/stores/feature';
	import { dispatchLayerUpdate } from '$lib/interaction/layer';
	import { percentToDecimal, decimalToPercent } from '$lib/utils/color';
	import { isChoroplethLayer } from '$lib/types/CartoKitLayer';
	import { isMapboxFillLayer } from '$lib/utils/mapbox';
	import type { MapboxGeoJSONFeature } from 'mapbox-gl';

	let activeColorIndex: number | null = null;
	const defaultColors = d3.schemeOranges[5];
	const defaultOpacity = 1;

	$: colors =
		$selectedLayer && isChoroplethLayer($selectedLayer)
			? $selectedLayer.style.breaks.colors
			: defaultColors;
	$: opacity = $selectedLayer
		? decimalToPercent($selectedLayer.style.opacity)
		: decimalToPercent(defaultOpacity);
	$: selectedColor = deriveActiveColor(activeColorIndex, $selectedFeature);

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

	function onColorClick(i: number) {
		activeColorIndex = i;
	}

	function onColorBlur() {
		activeColorIndex = null;
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

	function deriveActiveColor(idx: number | null, feature: MapboxGeoJSONFeature | null) {
		if (idx !== null) {
			return colors[idx];
		} else if (feature && isMapboxFillLayer(feature.layer)) {
			return d3
				.color(feature.layer.paint?.['fill-color']?.toString() ?? defaultColors[0])
				?.formatHex();
		} else {
			return colors[0];
		}
	}
</script>

<div class="font-mono text-xs text-white stack stack-xs">
	<div class="stack-h stack-xs py-2">
		<ColorScaleSelect />
		<ColorStopsSelect />
	</div>
	<div class="stack-h stack-xs">
		<ul class="color-palette flex">
			{#each colors as color, i}
				<li>
					<input
						type="color"
						class="appearance-none cursor-pointer bg-transparent p-0 h-4 w-4 {color ===
						selectedColor
							? 'relative outline outline-2 outline-white z-10'
							: ''}"
						value={color}
						on:input={(event) => onColorInput(event, i)}
						on:click={() => onColorClick(i)}
						on:blur={onColorBlur}
					/>
				</li>
			{/each}
		</ul>
		<input
			class="bg-inherit pl-2"
			size="7"
			value={selectedColor}
			on:change={(event) =>
				onColorInput(
					event,
					colors.findIndex((c) => c === selectedColor)
				)}
		/>
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
