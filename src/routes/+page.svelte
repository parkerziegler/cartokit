<script lang="ts">
	import { onMount } from 'svelte';
	import mapboxgl, { type MapLayerMouseEvent } from 'mapbox-gl';
	import { compileLayer, type CartoKitLayer } from '../lib/compile';
	import LayerPanel from '../lib/layers/LayerPanel.svelte';

	mapboxgl.accessToken =
		'pk.eyJ1IjoidG1jdyIsImEiOiJja3FmbGJoNXMxNmx5Mm9uejIxcmpiNjh2In0.2F8HR-8J859J7frYE6DG9g';

	const exampleLayer: CartoKitLayer = {
		name: 'nifc-fires',
		type: 'choropleth',
		data: 'https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/Fire_History_Perimeters_Public/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson',
		attribute: ''
	};

	onMount(() => {
		const map = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/mapbox/dark-v10',
			center: [-110, 35],
			zoom: 6
		});

		map.on('load', () => {
			eval(compileLayer(exampleLayer));

			map.addLayer({
				id: 'nifc-fires',
				source: 'nifc-fires',
				type: 'fill',
				paint: {
					'fill-color': '#fd6a0b'
				}
			});

			map.addLayer({
				id: 'nifc-fires-hover',
				type: 'line',
				source: 'nifc-fires',
				paint: {
					'line-color': '#ffffff',
					'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0]
				}
			});

			let hoveredFeatureId: string | null = null;

			const onMouseMove = (event: MapLayerMouseEvent) => {
				if (event.features && event.features.length > 0) {
					if (hoveredFeatureId !== null) {
						map.setFeatureState({ source: 'nifc-fires', id: hoveredFeatureId }, { hover: false });
					}

					hoveredFeatureId = event.features[0].id!.toString();
					map.setFeatureState({ source: 'nifc-fires', id: hoveredFeatureId }, { hover: true });
				}
			};

			const onMouseLeave = () => {
				if (hoveredFeatureId !== null) {
					map.setFeatureState({ source: 'nifc-fires', id: hoveredFeatureId }, { hover: false });
				}
				hoveredFeatureId = null;
			};

			map.on('mousemove', 'nifc-fires', onMouseMove);
			map.on('mouseleave', 'nifc-fires', onMouseLeave);
		});

		return () => {
			map.remove();
		};
	});
</script>

<main class="absolute inset-0">
	<div class="grid grid-cols-12 h-full w-full">
		<div class="col-span-2 text-slate-700 bg-slate-100 p-4">
			<h1 class="text-3xl font-bold pb-2 mb-2 border-b border-b-slate-400">cartokit</h1>
			<LayerPanel layers={['nifc-fires']} />
		</div>
		<div class="col-span-10" id="map" />
	</div>
</main>
