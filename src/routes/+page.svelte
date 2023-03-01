<script lang="ts">
	import { onMount } from 'svelte';
	import mapboxgl from 'mapbox-gl';
	import { PUBLIC_MAPBOX_ACCESS_TOKEN } from '$env/static/public';

	import { addLayer } from '$lib/interaction/layer';
	import { addSource } from '$lib/interaction/source';
	import { instrumentPolygonHover } from '$lib/interaction/hover';
	import { instrumentPolygonSelect, onFeatureLeave } from '$lib/interaction/select';
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

	mapboxgl.accessToken = PUBLIC_MAPBOX_ACCESS_TOKEN;

	let map: mapboxgl.Map;

	onMount(() => {
		map = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/mapbox/dark-v10',
			center: [-81, 26.5],
			zoom: 7
		});

		map.on('load', () => {
			Object.values($layers).forEach((layer) => {
				addSource(map, layer);
				addLayer(map, layer);
				instrumentPolygonHover(map, layer);
				instrumentPolygonSelect(map, layer);
			});
		});

		// Add an event listener to handle feature deselection.
		map.on('click', onFeatureLeave(map, $layers));

		// When the map first reaches an idle state, set it in the store.
		// This _should_ ensure that the map's styles and data have fully loaded.
		map.once('idle', () => {
			mapStore.set(map);
		});

		return () => {
			map.remove();
		};
	});
</script>

<main class="absolute inset-0">
	<div class="grid grid-cols-12 h-full w-full">
		<div class="col-span-12" id="map" />
		<Menu className="absolute top-4 right-4 max-w-xl overflow-auto style-editor">
			{#if $selectedFeature}
				<MenuItem title="Map Type">
					<MapTypeSelect />
				</MenuItem>
			{/if}
			{#if $mapType === 'Choropleth' && $selectedFeature}
				<MenuItem title="Attribute">
					<AttributeSelect />
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
