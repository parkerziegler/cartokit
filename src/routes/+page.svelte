<script lang="ts">
  import { onMount } from 'svelte';
  import maplibregl from 'maplibre-gl';
  import cs from 'classnames';

  import BasemapPicker from '$lib/components/basemap/BasemapPicker.svelte';
  import Editor from '$lib/components/editor/Editor.svelte';
  import CloseIcon from '$lib/components/icons/CloseIcon.svelte';
  import TableIcon from '$lib/components/icons/TableIcon.svelte';
  import AddLayer from '$lib/components/layers/AddLayer.svelte';
  import LayerPanel from '$lib/components/layers/LayerPanel.svelte';
  import MapTypeSelect from '$lib/components/map-types/MapTypeSelect.svelte';
  import PointPropertiesPanel from '$lib/components/properties/PointPropertiesPanel.svelte';
  import ProportionalSymbolPropertiesPanel from '$lib/components/properties/ProportionalSymbolPropertiesPanel.svelte';
  import DotDensityPropertiesPanel from '$lib/components/properties/DotDensityPropertiesPanel.svelte';
  import LinePropertiesPanel from '$lib/components/properties/LinePropertiesPanel.svelte';
  import FillPropertiesPanel from '$lib/components/properties/FillPropertiesPanel.svelte';
  import ChoroplethPropertiesPanel from '$lib/components/properties/ChoroplethPropertiesPanel.svelte';
  import DataTable from '$lib/components/shared/DataTable.svelte';
  import Menu from '$lib/components/shared/Menu.svelte';
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import MenuTitle from '$lib/components/shared/MenuTitle.svelte';
  import { onFeatureLeave } from '$lib/interaction/select';
  import { ir } from '$lib/stores/ir';
  import { map as mapStore } from '$lib/stores/map';
  import { selectedFeature } from '$lib/stores/selected-feature';
  import { selectedLayer } from '$lib/stores/selected-layer';

  let map: maplibregl.Map;
  let editorOpen = false;
  let dataOpen = false;

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

  const toggleEditorVisibility = () => {
    editorOpen = !editorOpen;
  };

  const onViewDataClick = () => {
    dataOpen = true;
  };

  const onViewDataClose = () => {
    dataOpen = false;
  };

  const onClosePropertiesMenu = () => {
    if ($selectedFeature) {
      map.removeFeatureState(
        { source: $selectedFeature.layer.id, id: $selectedFeature.id },
        'selected'
      );

      selectedFeature.set(null);
    }
  };
</script>

<main class="absolute inset-0">
  <div class="grid h-full w-full grid-cols-12">
    <div
      class="relative col-span-12"
      id="map"
      class:col-span-8={editorOpen}
      class:map--compact={dataOpen}
    >
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
          class={cs(
            'properties absolute right-4 top-4 z-10 max-w-sm overflow-auto',
            {
              'properties--compact': dataOpen
            }
          )}
        >
          <MenuTitle class="pr-4"
            >{$selectedLayer.displayName}
            <button on:click={onClosePropertiesMenu} slot="action">
              <CloseIcon />
            </button>
            <div class="stack-h stack-h-xs" slot="subtitle">
              <button on:click={onViewDataClick}>
                <TableIcon />
              </button>
            </div>
          </MenuTitle>
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
      <BasemapPicker layout={dataOpen ? 'compact' : 'full'} />
      <button
        class={cs(
          'absolute bottom-12 right-4 z-10 rounded-md bg-slate-900 px-3 py-2 text-sm tracking-wider text-white shadow-lg transition-transform duration-[400ms] ease-out',
          {
            '-translate-y-72': dataOpen
          }
        )}
        on:click={toggleEditorVisibility}
      >
        {editorOpen ? 'Close Editor' : 'Open Editor'}
      </button>
      {#if dataOpen && $selectedLayer}
        <DataTable
          data={$selectedLayer.data.geoJSON.features}
          tableName={$selectedLayer.displayName}
          onClose={onViewDataClose}
          class="absolute bottom-0 h-72"
        />
      {/if}
    </div>
    {#if editorOpen}
      <Editor />
    {/if}
  </div>
</main>

<style>
  :global(#map .maplibregl-ctrl-attrib.maplibregl-compact) {
    @apply transition-transform duration-[400ms] ease-out;
  }

  :global(#map.map--compact .maplibregl-ctrl-attrib.maplibregl-compact) {
    @apply -translate-y-72;
  }

  :global(.properties) {
    max-height: calc(100% - 2rem);
    transition: max-height 200ms ease-out;
  }

  :global(.properties--compact) {
    max-height: calc(100% - 25.25rem);
  }
</style>
