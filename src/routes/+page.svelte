<script lang="ts">
  import { onMount } from 'svelte';
  import maplibregl from 'maplibre-gl';

  import { PUBLIC_MAPTILER_API_KEY } from '$env/static/public';
  import ColorPicker from '$lib/components/color/ColorPicker.svelte';
  import AddLayer from '$lib/components/layers/AddLayer.svelte';
  import LayerPanel from '$lib/components/layers/LayerPanel.svelte';
  import Menu from '$lib/components/shared/Menu.svelte';
  import Program from '$lib/components/program/Program.svelte';
  import ColorPalette from '$lib/components/color/ColorPalette.svelte';
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import MenuTitle from '$lib/components/shared/MenuTitle.svelte';
  import MapTypeSelect from '$lib/components/map-types/MapTypeSelect.svelte';
  import AttributeSelect from '$lib/components/data/AttributeSelect.svelte';
  import SizeControls from '$lib/components/size/SizeControls.svelte';
  import DotControls from '$lib/components/dots/DotControls.svelte';
  import { addSource } from '$lib/interaction/source';
  import { onFeatureLeave } from '$lib/interaction/select';
  import { layers } from '$lib/stores/layers';
  import { map as mapStore } from '$lib/stores/map';
  import { mapType } from '$lib/stores/map-type';
  import { selectedFeature } from '$lib/stores/selected-feature';
  import { selectedLayer } from '$lib/stores/selected-layer';

  let map: maplibregl.Map;

  onMount(() => {
    map = new maplibregl.Map({
      container: 'map',
      style: `https://api.maptiler.com/maps/dataviz-light/style.json?key=${PUBLIC_MAPTILER_API_KEY}`,
      center: [-105.43649607942392, 35.90953012430907],
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

  let programVisible = false;

  function toggleProgramVisibility() {
    programVisible = !programVisible;
  }
</script>

<main class="absolute inset-0">
  <div class="grid h-full w-full grid-cols-12">
    <div
      class="relative col-span-12"
      id="map"
      class:col-span-8={programVisible}
    >
      <Menu class="absolute top-4 left-4 z-10 max-w-xl overflow-auto">
        <MenuTitle>
          Layers
          <AddLayer slot="action" />
        </MenuTitle>
        <LayerPanel />
      </Menu>
      {#if $selectedFeature}
        <Menu
          class="style-editor absolute top-4 right-4 z-10 max-w-sm overflow-auto"
        >
          <MenuTitle>Properties</MenuTitle>
          <MenuItem title="Map Type">
            <MapTypeSelect />
          </MenuItem>
          {#if $selectedLayer?.type === 'Choropleth'}
            <MenuItem title="Attribute">
              <AttributeSelect />
            </MenuItem>
            <MenuItem title="Palette">
              <ColorPalette layer={$selectedLayer} />
            </MenuItem>
          {:else if $mapType === 'Proportional Symbol'}
            <MenuItem title="Attribute">
              <AttributeSelect />
            </MenuItem>
            <MenuItem title="Size">
              <SizeControls />
            </MenuItem>
            <MenuItem title="Fill">
              <ColorPicker />
            </MenuItem>
          {:else if $mapType === 'Dot Density'}
            <MenuItem title="Attribute">
              <AttributeSelect />
            </MenuItem>
            <MenuItem title="Dots">
              <DotControls />
            </MenuItem>
            <MenuItem title="Fill">
              <ColorPicker />
            </MenuItem>
          {:else}
            <MenuItem title="Style">
              <ColorPicker />
            </MenuItem>
          {/if}
        </Menu>
      {/if}
      <div class="absolute bottom-8 right-4 z-10 rounded-md bg-slate-900">
        <button
          on:click={toggleProgramVisibility}
          class="p-2 font-mono text-xs text-white"
          >{programVisible ? 'Hide Source' : 'View Source'}</button
        >
      </div>
    </div>
    {#if programVisible}
      <div class="col-span-4">
        <Program />
      </div>
    {/if}
  </div>
</main>
