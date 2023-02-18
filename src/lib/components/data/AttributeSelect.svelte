<script lang="ts">
	import type { MapboxGeoJSONFeature } from 'mapbox-gl';

	import Select from '$lib/components/shared/Select.svelte';
	import { layers } from '$lib/stores/layers';
	import { isChoroplethLayer } from '$lib/types/CartoKitLayer';
	import { map } from '$lib/stores/map';
	import { deriveColorScale } from '$lib/interaction/color';

	export let selectedFeature: MapboxGeoJSONFeature;

	const options = Object.keys(selectedFeature.properties ?? {});
	const layer = $layers.find((layer) => layer.id === selectedFeature.layer.id);
	const selected = layer && isChoroplethLayer(layer) ? layer.attribute : '';

	function onChange(event: CustomEvent<{ value: string }>) {
		const attribute = event.detail.value;

		layers.update((ls) => {
			const layer = ls.find((l) => l.id === selectedFeature.layer.id);

			if (layer && isChoroplethLayer(layer)) {
				layer.attribute = attribute;
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

<Select {options} {selected} on:change={onChange} />
