<script lang="ts">
	import SizeInput from '$lib/components/size/SizeInput.svelte';
	import { dispatchLayerUpdate } from '$lib/interaction/update';
	import { selectedLayer } from '$lib/stores/selected-layer';
	import { map } from '$lib/stores/map';
	import { isProportionalSymbolLayer } from '$lib/types/CartoKitLayer';

	$: min =
		$selectedLayer && isProportionalSymbolLayer($selectedLayer) ? $selectedLayer.style.size.min : 0;
	$: max =
		$selectedLayer && isProportionalSymbolLayer($selectedLayer)
			? $selectedLayer.style.size.max
			: 50;

	function onSizeChange(field: 'min' | 'max') {
		return function handleSizeChange(event: CustomEvent<{ value: number }>) {
			if ($selectedLayer && $map && isProportionalSymbolLayer($selectedLayer)) {
				dispatchLayerUpdate({
					type: 'size',
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
	<SizeInput title="Min" value={min} onSizeChange={onSizeChange('min')} />
	<SizeInput title="Max" value={max} onSizeChange={onSizeChange('max')} />
</div>
