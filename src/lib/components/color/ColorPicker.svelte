<script lang="ts">
	import { onDestroy } from 'svelte';

	import { map } from '$lib/stores/map';
	import { layers } from '$lib/stores/layers';
	import { selectedFeature } from '$lib/stores/feature';
	import { selectedLayer } from '$lib/stores/selected-layer';
	import { program } from '$lib/stores/program';
	import { decimalToPercent, percentToDecimal, rgbToHex } from '$lib/utils/color';
	import { compile } from '$lib/compile/compile';
	import { dispatchLayerUpdate } from '$lib/interaction/layer';

	const defaultColor = '#FFFFFF';
	const defaultOpacity = 100;
	let color = defaultColor;
	let opacity = defaultOpacity;

	const unsubscribe = selectedFeature.subscribe((feature) => {
		if (feature && feature.layer.paint) {
			if ('fill-color' in feature.layer.paint) {
				// @ts-ignore – toArray() is not in the type definition but exists on the prototype.
				const [r, g, b] = feature.layer.paint['fill-color']?.toArray() ?? [255, 255, 255];
				color = rgbToHex(r, g, b);
			}

			if ('fill-opacity' in feature.layer.paint) {
				opacity = decimalToPercent(
					(feature.layer.paint['fill-opacity'] as number | undefined) ?? 1
				);
			}
		} else {
			color = defaultColor;
			opacity = defaultOpacity;
		}
	});

	const onColorInput = (event: Event) => {
		const target = event.target as HTMLInputElement;
		color = target.value;

		if ($selectedFeature && $map) {
			dispatchLayerUpdate({
				type: 'fill',
				map: $map,
				layer: $selectedLayer,
				payload: {
					color
				}
			});
			program.set(compile($map, $layers));
		}
	};

	const onOpacityChange = (event: Event) => {
		const target = event.target as HTMLInputElement;
		opacity = Math.min(100, Math.max(0, +target.value));

		if ($selectedFeature && $map) {
			dispatchLayerUpdate({
				type: 'opacity',
				map: $map,
				layer: $selectedLayer,
				payload: {
					opacity: percentToDecimal(opacity)
				}
			});
			program.set(compile($map, $layers));
		}
	};

	onDestroy(unsubscribe);
</script>

<div class="color-picker flex">
	<div class="stack-h stack-xs font-mono text-xs text-white">
		<input
			type="color"
			class="appearance-none cursor-pointer p-0 h-4 w-4 rounded"
			bind:value={color}
			on:input={onColorInput}
		/>
		<input type="text" class="bg-inherit pl-2" size="7" bind:value={color} />
		<span>
			<input
				type="number"
				class="bg-inherit w-8 text-right"
				min="0"
				max="100"
				bind:value={opacity}
				on:change={onOpacityChange}
			/>
			%
		</span>
	</div>
</div>
