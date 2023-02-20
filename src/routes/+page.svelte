<script lang="ts">
	import { onMount } from 'svelte';
	import mapboxgl from 'mapbox-gl';

	import { addLayer } from '$lib/interaction/layer';
	import { addSource } from '$lib/interaction/source';
	import { instrumentHover } from '$lib/interaction/hover';
	import { instrumentSelect } from '$lib/interaction/select';
	import { map as mapStore } from '$lib/stores/map';
	import { layers } from '$lib/stores/layers';
	import { selectedFeature } from '$lib/stores/feature';
	import { mapType } from '$lib/stores/map-type';
	import ColorPicker from '$lib/components/color/ColorPicker.svelte';
	import Menu from '$lib/components/shared/Menu.svelte';
	import Program from '$lib/components/program/Program.svelte';
	import ColorPalette from '$lib/components/color/ColorPalette.svelte';
	import MapTypeSelect from '$lib/components/map-types/MapTypeSelect.svelte';
	import MenuItem from '$lib/components/shared/MenuItem.svelte';
	import AttributeSelect from '$lib/components/data/AttributeSelect.svelte';

	mapboxgl.accessToken =
		'pk.eyJ1IjoidG1jdyIsImEiOiJja3FmbGJoNXMxNmx5Mm9uejIxcmpiNjh2In0.2F8HR-8J859J7frYE6DG9g';

	onMount(() => {
		const map = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/mapbox/dark-v10',
			center: [-110, 35],
			zoom: 6
		});

		mapStore.set(map);

		map.on('load', () => {
			$layers.forEach((layer) => {
				addSource(map, layer);
				addLayer(map, layer);

				instrumentHover(map, layer);
			});

			instrumentSelect({
				map,
				layers: $layers,
				selectedFeature
			});
		});

		return () => {
			map.remove();
		};
	});
</script>

<main class="absolute inset-0">
	<div class="grid grid-cols-12 h-full w-full">
		<div class="col-span-12" id="map" />
		<Menu className="absolute top-4 right-4 max-w-xl">
			{#if $selectedFeature}
				<MenuItem title="Map Type">
					<MapTypeSelect />
				</MenuItem>
			{/if}
			{#if $mapType === 'Choropleth' && $selectedFeature}
				<MenuItem title="Attribute">
					<AttributeSelect selectedFeature={$selectedFeature} />
				</MenuItem>
				<MenuItem title="Palette">
					<ColorPalette />
				</MenuItem>
			{:else}
				<MenuItem title="Fill">
					<ColorPicker />
				</MenuItem>
			{/if}
			<MenuItem title="Program">
				<Program />
			</MenuItem>
		</Menu>
	</div>
</main>
