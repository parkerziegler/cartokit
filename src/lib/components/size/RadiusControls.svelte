<script lang="ts">
	import RadiusInput from '$lib/components/size/RadiusInput.svelte';
	import { dispatchLayerUpdate } from '$lib/interaction/update';
	import { selectedLayer } from '$lib/stores/selected-layer';
	import { map } from '$lib/stores/map';
	import { isProportionalSymbolLayer } from '$lib/types/CartoKitLayer';

	$: min =
		$selectedLayer && isProportionalSymbolLayer($selectedLayer)
			? $selectedLayer.style.radius.min
			: 0;
	$: max =
		$selectedLayer && isProportionalSymbolLayer($selectedLayer)
			? $selectedLayer.style.radius.max
			: 50;

	function onRadiusChange(field: 'min' | 'max') {
		return function handleRadiusChange(event: CustomEvent<{ value: number }>) {
			if ($selectedLayer && $map && isProportionalSymbolLayer($selectedLayer)) {
				dispatchLayerUpdate({
					type: 'radius',
					map: $map,
					layer: $selectedLayer,
					payload: {
						[field]: event.detail.value
					}
				});
			}
		};
	}
</script>

<div class="stack-h stack-h-xs">
	<RadiusInput title="Min" value={min} onRadiusChange={onRadiusChange('min')} />
	<RadiusInput title="Max" value={max} onRadiusChange={onRadiusChange('max')} />
</div>
