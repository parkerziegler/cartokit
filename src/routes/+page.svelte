<script lang="ts">
  import { onMount } from 'svelte';
  import maplibregl from 'maplibre-gl';

  import BasemapPicker from '$lib/components/basemap/BasemapPicker.svelte';
  import Editor from '$lib/components/editor/Editor.svelte';
  import AddLayer from '$lib/components/layers/AddLayer.svelte';
  import LayerPanel from '$lib/components/layers/LayerPanel.svelte';
  import MapTypeSelect from '$lib/components/map-types/MapTypeSelect.svelte';
  import PointPropertiesPanel from '$lib/components/properties/PointPropertiesPanel.svelte';
  import ProportionalSymbolPropertiesPanel from '$lib/components/properties/ProportionalSymbolPropertiesPanel.svelte';
  import DotDensityPropertiesPanel from '$lib/components/properties/DotDensityPropertiesPanel.svelte';
  import LinePropertiesPanel from '$lib/components/properties/LinePropertiesPanel.svelte';
  import FillPropertiesPanel from '$lib/components/properties/FillPropertiesPanel.svelte';
  import ChoroplethPropertiesPanel from '$lib/components/properties/ChoroplethPropertiesPanel.svelte';
  import Menu from '$lib/components/shared/Menu.svelte';
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import MenuTitle from '$lib/components/shared/MenuTitle.svelte';
  import { onFeatureLeave } from '$lib/interaction/select';
  import { ir } from '$lib/stores/ir';
  import { map as mapStore } from '$lib/stores/map';
  import { selectedLayer } from '$lib/stores/selected-layer';

  let map: maplibregl.Map;

  onMount(() => {
    map = new maplibregl.Map({
      container: 'map',
      style: $ir.basemap.url,
      center: $ir.center,
      zoom: $ir.zoom
    });

    // Add an event listener to handle feature deselection.
    map.on('click', onFeatureLeave(map, $ir));

    // When the map first reaches an idle state, set it in the store.
    // This _should_ ensure that the map's styles and data have fully loaded.
    map.once('idle', () => {
      mapStore.set(map);
    });

    map.on('move', (event) => {
      ir.update((ir) => {
        const { lng, lat } = event.target.getCenter();
        ir.center = [lng, lat];

        return ir;
      });
    });

    map.on('zoom', (event) => {
      ir.update((ir) => {
        ir.zoom = event.target.getZoom();

        return ir;
      });
    });

    return () => {
      map.remove();
    };
  });

  let editorOpen = false;

  function toggleEditorVisibility() {
    editorOpen = !editorOpen;
  }
</script>

<main class="absolute inset-0">
  <div class="grid h-full w-full grid-cols-12">
    <div class="relative col-span-12" id="map" class:col-span-8={editorOpen}>
      <Menu class="min-w-xs absolute left-4 top-4 z-10 max-w-lg overflow-auto">
        <MenuTitle class="mr-4">
          Layers
          <AddLayer slot="action" />
        </MenuTitle>
        <LayerPanel />
      </Menu>
      {#if $selectedLayer}
        <Menu
          id="properties"
          class="style-editor absolute right-4 top-4 z-10 max-w-sm overflow-auto"
        >
          <MenuTitle>Properties</MenuTitle>
          <MenuItem title="Map Type">
            <MapTypeSelect layer={$selectedLayer} />
          </MenuItem>
          {#if $selectedLayer.type === 'Point'}
            <PointPropertiesPanel layer={$selectedLayer} />
          {:else if $selectedLayer.type === 'Proportional Symbol'}
            <ProportionalSymbolPropertiesPanel layer={$selectedLayer} />
          {:else if $selectedLayer.type === 'Dot Density'}
            <DotDensityPropertiesPanel layer={$selectedLayer} />
          {:else if $selectedLayer.type === 'Line'}
            <LinePropertiesPanel layer={$selectedLayer} />
          {:else if $selectedLayer.type === 'Fill'}
            <FillPropertiesPanel layer={$selectedLayer} />
          {:else if $selectedLayer.type === 'Choropleth'}
            <ChoroplethPropertiesPanel layer={$selectedLayer} />
          {/if}
        </Menu>
      {/if}
      <BasemapPicker />
      <button
        class="absolute bottom-8 right-4 z-10 rounded-md bg-slate-900 px-3 py-2 text-sm tracking-wider text-white shadow-lg"
        on:click={toggleEditorVisibility}
      >
        {editorOpen ? 'Close Editor' : 'Open Editor'}
      </button>
    </div>
    {#if editorOpen}
      <Editor />
    {/if}
  </div>
</main>
