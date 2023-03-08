<script lang="ts">
	import { onMount } from 'svelte';
	import maplibregl from 'maplibre-gl';

	import { PUBLIC_MAPTILER_API_KEY } from '$env/static/public';
	import ColorPicker from '$lib/components/color/ColorPicker.svelte';
	import Menu from '$lib/components/shared/Menu.svelte';
	import Program from '$lib/components/program/Program.svelte';
	import ColorPalette from '$lib/components/color/ColorPalette.svelte';
	import MapTypeSelect from '$lib/components/map-types/MapTypeSelect.svelte';
	import MenuItem from '$lib/components/shared/MenuItem.svelte';
	import AttributeSelect from '$lib/components/data/AttributeSelect.svelte';
	import RadiusControls from '$lib/components/size/RadiusControls.svelte';
	import { addSource } from '$lib/interaction/source';
	import { onFeatureLeave } from '$lib/interaction/select';
	import { map as mapStore } from '$lib/stores/map';
	import { layers } from '$lib/stores/layers';
	import { selectedFeature } from '$lib/stores/feature';
	import { mapType } from '$lib/stores/map-type';

	let map: maplibregl.Map;

	onMount(() => {
		map = new maplibregl.Map({
			container: 'map',
			style: `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${PUBLIC_MAPTILER_API_KEY}`,
			center: [-120, 37],
			zoom: 5
		});

		map.on('load', () => {
			Object.values($layers).forEach((layer) => {
				addSource(map, layer);
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
			{:else if $mapType === 'Proportional Symbol' && $selectedFeature}
				<MenuItem title="Attribute">
					<AttributeSelect />
				</MenuItem>
				<MenuItem title="Radius">
					<RadiusControls />
				</MenuItem>
				<MenuItem title="Fill">
					<ColorPicker />
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
