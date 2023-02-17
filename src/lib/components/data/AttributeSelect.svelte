<script lang="ts">
	import type { MapboxGeoJSONFeature } from 'mapbox-gl';

	import Select from '$lib/components/shared/Select.svelte';
	import { layers } from '$lib/stores/layers';

	export let selectedFeature: MapboxGeoJSONFeature;

	const options = Object.keys(selectedFeature.properties ?? {});
	const selected = $layers.find((layer) => layer.id === selectedFeature.layer.id)?.attribute ?? '';

	function onChange(event: CustomEvent<{ value: string }>) {
		const attribute = event.detail.value;

		layers.update((ls) => {
			const layer = ls.find((l) => l.id === selectedFeature.layer.id);

			if (layer) {
				layer.attribute = attribute;
			}

			return ls;
		});
	}
</script>

<Select {options} {selected} on:change={onChange} />
