<script lang="ts">
	import * as d3 from 'd3';
	import type { MapboxGeoJSONFeature } from 'mapbox-gl';

	import ColorScaleSelect from '$lib/components/color/ColorScaleSelect.svelte';
	import ColorStopsSelect from '$lib/components/color/ColorStopsSelect.svelte';
	import HexInput from '$lib/components/color/HexInput.svelte';
	import { dispatchLayerUpdate } from '$lib/interaction/layer';
	import { map } from '$lib/stores/map';
	import { layers } from '$lib/stores/layers';
	import { selectedLayer } from '$lib/stores/selected-layer';
	import { selectedFeature } from '$lib/stores/feature';
	import { isChoroplethLayer } from '$lib/types/CartoKitLayer';
	import { percentToDecimal, decimalToPercent } from '$lib/utils/color';
	import { DEFAULT_OPACITY, DEFAULT_PALETTE } from '$lib/utils/constants';
	import { isMapboxFillLayer } from '$lib/utils/mapbox';

	let activeColorIndex: number | null = null;

	$: colors =
		$selectedLayer && isChoroplethLayer($selectedLayer)
			? $selectedLayer.style.breaks.colors
			: DEFAULT_PALETTE;
	$: opacity = $selectedLayer
		? decimalToPercent($selectedLayer.style.opacity)
		: decimalToPercent(DEFAULT_OPACITY);
	$: selectedColor = deriveActiveColor(activeColorIndex, $selectedFeature);

	function onColorInput(i: number) {
		return function handleColorInput(event: Event) {
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
		};
	}

	function onHexChange(hex: string, i: number) {
		if ($selectedLayer && $map) {
			dispatchLayerUpdate({
				type: 'color-palette-color',
				map: $map,
				layer: $selectedLayer,
				layers: $layers,
				payload: {
					color: hex,
					index: i
				}
			});
		}
	}

	function onColorClick(i: number) {
		return function handleColorClick(_event: Event) {
			activeColorIndex = i;
		};
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

	function deriveActiveColor(idx: number | null, feature: MapboxGeoJSONFeature | null): string {
		if (idx !== null) {
			console.log('Returning color from activeIndex: ', colors[idx]);
			return colors[idx];
		} else if (feature && isMapboxFillLayer(feature.layer)) {
			console.log(
				'Returning color from feature: ',
				d3.color(feature.layer.paint?.['fill-color']?.toString() ?? colors[0])?.formatHex()
			);
			return (
				d3.color(feature.layer.paint?.['fill-color']?.toString() ?? colors[0])?.formatHex() ??
				colors[0]
			);
		} else {
			return colors[0];
		}
	}
</script>

<div class="stack-h stack-h-md">
	<ColorScaleSelect />
	<ColorStopsSelect />
</div>
<div class="stack-h stack-h-xs">
	<ul class="flex py-2 color-palette">
		{#each colors as color, i}
			<li>
				<input
					type="color"
					class="appearance-none cursor-pointer bg-transparent p-0 h-4 w-4 {color === selectedColor
						? 'relative outline outline-2 outline-white z-10'
						: ''}"
					value={color}
					on:input={onColorInput(i)}
					on:click={onColorClick(i)}
					on:blur={onColorBlur}
				/>
			</li>
		{/each}
	</ul>
	<HexInput
		hex={selectedColor}
		{opacity}
		onHexChange={(hex) =>
			onHexChange(
				hex,
				colors.findIndex((c) => c === selectedColor)
			)}
		{onOpacityChange}
	/>
</div>
