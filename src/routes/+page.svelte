<script lang="ts">
  import cs from 'classnames';
  import maplibregl from 'maplibre-gl';
  import { onMount } from 'svelte';

  import BasemapPicker from '$lib/components/basemap/BasemapPicker.svelte';
  import Editor from '$lib/components/editor/Editor.svelte';
  import CloseIcon from '$lib/components/icons/CloseIcon.svelte';
  import TableIcon from '$lib/components/icons/TableIcon.svelte';
  import AddLayer from '$lib/components/layers/AddLayer.svelte';
  import LayerPanel from '$lib/components/layers/LayerPanel.svelte';
  import MapTypeSelect from '$lib/components/map-types/MapTypeSelect.svelte';
  import ChoroplethPropertiesPanel from '$lib/components/properties/ChoroplethPropertiesPanel.svelte';
  import DotDensityPropertiesPanel from '$lib/components/properties/DotDensityPropertiesPanel.svelte';
  import FillPropertiesPanel from '$lib/components/properties/FillPropertiesPanel.svelte';
  import LinePropertiesPanel from '$lib/components/properties/LinePropertiesPanel.svelte';
  import PointPropertiesPanel from '$lib/components/properties/PointPropertiesPanel.svelte';
  import ProportionalSymbolPropertiesPanel from '$lib/components/properties/ProportionalSymbolPropertiesPanel.svelte';
  import Button from '$lib/components/shared/Button.svelte';
  import DataTable from '$lib/components/shared/DataTable.svelte';
  import Menu from '$lib/components/shared/Menu.svelte';
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import MenuTitle from '$lib/components/shared/MenuTitle.svelte';
  import { onFeatureLeave } from '$lib/interaction/select';
  import { db } from '$lib/stores/db';
  import { ir } from '$lib/stores/ir';
  import { layout } from '$lib/stores/layout';
  import { map as mapStore } from '$lib/stores/map';
  import { selectedFeature } from '$lib/stores/selected-feature';
  import { selectedLayer } from '$lib/stores/selected-layer';
  import { instantiateDuckDB } from '$lib/utils/duckdb';

  let map: maplibregl.Map;

  onMount(() => {
    // maplibre-gl is actually a CJS module, and not all module.exports may be
    // supported as named exports.
    // eslint-disable-next-line import/no-named-as-default-member
    map = new maplibregl.Map({
      container: 'map',
      style: $ir.basemap.url,
      center: $ir.center,
      zoom: $ir.zoom
    });

    // Add an event listener to handle feature deselection.
    map.on('click', onFeatureLeave(map, $ir));

    // When the map first reaches an idle state, set it in the store.
    // This should ensure that the map's styles and data have fully loaded.
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

    instantiateDuckDB().then((duckdb) => {
      db.set(duckdb);
    });

    return () => {
      map.remove();
    };
  });

  const toggleEditorVisibility = () => {
    layout.update((layout) => {
      layout.editorVisible = !layout.editorVisible;

      return layout;
    });
  };

  const onViewDataClick = () => {
    layout.update((layout) => {
      layout.dataVisible = !layout.dataVisible;

      return layout;
    });
  };

  const onViewDataClose = () => {
    layout.update((layout) => {
      layout.dataVisible = false;

      return layout;
    });
  };

  const onPropertiesMenuClose = () => {
    if ($selectedFeature) {
      map.removeFeatureState(
        { source: $selectedFeature.layer.id, id: $selectedFeature.id },
        'selected'
      );

      selectedFeature.set(null);
    }

    if ($layout.dataVisible) {
      layout.update((layout) => {
        layout.dataVisible = false;

        return layout;
      });
    }
  };
</script>

<main class="absolute inset-0">
  <div
    class="relative h-full w-full"
    class:map--y-compact={$layout.dataVisible}
    class:map--x-compact={$layout.editorVisible}
    id="map"
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
            'properties--y-compact': $layout.dataVisible,
            'properties--x-compact': $layout.editorVisible
          }
        )}
      >
        <MenuTitle class="mr-4"
          >{$selectedLayer.displayName}
          <button on:click={onPropertiesMenuClose} slot="action">
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
    <BasemapPicker />
    <Button
      class={cs(
        'absolute bottom-12 right-4 z-10 rounded-md bg-slate-900 tracking-wider shadow-lg transition-transform duration-[400ms] ease-out',
        {
          '-translate-y-72': $layout.dataVisible,
          '-translate-x-[33.333333vw]': $layout.editorVisible
        }
      )}
      on:click={toggleEditorVisibility}
    >
      {$layout.editorVisible ? 'Close Editor' : 'Open Editor'}
    </Button>
    {#if $layout.dataVisible && $selectedLayer}
      <DataTable
        data={$selectedLayer.data.geoJSON.features}
        tableName={$selectedLayer.displayName}
        onClose={onViewDataClose}
        class={cs(
          'absolute bottom-0 h-72 transition-all duration-[400ms] ease-out',
          $layout.editorVisible ? 'w-2/3' : 'w-full'
        )}
      />
    {/if}
  </div>
  {#if $layout.editorVisible}
    <Editor />
  {/if}
</main>

<style>
  :global(#map .maplibregl-ctrl-attrib.maplibregl-compact) {
    @apply transition-transform duration-[400ms] ease-out;
  }

  :global(#map.map--y-compact .maplibregl-ctrl-attrib.maplibregl-compact) {
    @apply -translate-y-72;
  }

  :global(#map.map--x-compact .maplibregl-ctrl-attrib.maplibregl-compact) {
    @apply -translate-x-[33.333333vw];
  }

  :global(.properties) {
    max-height: calc(100% - 2rem);
    transition:
      max-height 200ms ease-out,
      transform 400ms cubic-bezier(0, 0, 0.2, 1);
  }

  :global(.properties--x-compact) {
    @apply -translate-x-[33.333333vw];
  }

  :global(.properties--y-compact) {
    max-height: calc(100% - 25.25rem);
  }
</style>
