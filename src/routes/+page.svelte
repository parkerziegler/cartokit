<script lang="ts">
  import maplibregl from 'maplibre-gl';
  import { onMount, setContext } from 'svelte';

  import type { PageData } from './$types';

  import Editor from '$lib/components/editor/Editor.svelte';
  import AddLayer from '$lib/components/layers/AddLayer.svelte';
  import LayerPanel from '$lib/components/layers/LayerPanel.svelte';
  import PropertiesMenu from '$lib/components/properties/PropertiesMenu.svelte';
  import Alert from '$lib/components/shared/Alert.svelte';
  import DataTable from '$lib/components/shared/DataTable.svelte';
  import Menu from '$lib/components/shared/Menu.svelte';
  import MenuTitle from '$lib/components/shared/MenuTitle.svelte';
  import Toolbar from '$lib/components/toolbar/Toolbar.svelte';
  import { onFeatureLeave } from '$lib/interaction/select';
  import { ir } from '$lib/stores/ir';
  import { layout } from '$lib/stores/layout';
  import { map as mapStore } from '$lib/stores/map';
  import { selectedLayer } from '$lib/stores/selected-layer';
  import { initHistory } from '$lib/utils/history';
  import { user } from '$lib/state/user.svelte';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let map = $state<maplibregl.Map>();
  let error = $state({ message: '' });
  user.userId = data.userId;

  setContext('enableChat', data.enableChat);

  onMount(() => {
    // maplibre-gl is actually a CJS module, and not all module.exports may be
    // supported as named exports.
    map = new maplibregl.Map({
      container: 'map',
      style: data.basemap.url,
      center: $ir.center,
      zoom: $ir.zoom
    });

    // Add an event listener to handle feature deselection.
    map.on('click', onFeatureLeave(map, $ir));

    // When the map first reaches an idle state, set it in the store.
    // This should ensure that the map's styles and data have fully loaded.
    map.once('idle', () => {
      mapStore.set(map!);

      ir.update((ir) => {
        ir.basemap.url = data.basemap.url;
        ir.basemap.provider = data.basemap.provider;

        return ir;
      });
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

    map.on('style.load', () => {
      map?.setProjection({ type: $ir.projection });
    });

    map.on('error', () => {
      error.message = 'A map rendering error occurred.';

      window.setTimeout(() => {
        error.message = '';
      }, 5000);
    });

    const destroyHistory = initHistory();

    return () => {
      map!.remove();
      destroyHistory();
    };
  });

  function toggleEditorVisibility() {
    layout.update((layout) => {
      layout.editorVisible = !layout.editorVisible;

      return layout;
    });
  }

  function onViewDataClose() {
    layout.update((layout) => {
      layout.dataVisible = false;

      return layout;
    });
  }
</script>

<main class="absolute inset-0">
  <div
    class={[
      'maplibregl-map relative h-full w-full',
      $layout.dataVisible && 'compact-y',
      $layout.editorVisible && 'compact-x'
    ]}
    id="map"
  >
    <Menu class="absolute top-4 left-4 z-10 max-w-lg overflow-auto">
      <MenuTitle class="mr-4">
        Layers
        {#snippet action()}
          <AddLayer />
        {/snippet}
      </MenuTitle>
      <LayerPanel />
    </Menu>
    {#if $selectedLayer}
      <PropertiesMenu map={map!} layer={$selectedLayer} />
    {/if}
    <Toolbar />
    <button
      class={[
        'absolute right-4 bottom-12 z-10 rounded-md bg-slate-900 px-3 py-2 text-sm tracking-wider text-white shadow-lg transition-transform duration-400 ease-out disabled:cursor-not-allowed',
        $layout.dataVisible && '-translate-y-72',
        $layout.editorVisible && '-translate-x-[33.333333vw]'
      ]}
      onclick={toggleEditorVisibility}
      disabled={!$mapStore}
      data-testid="editor-toggle"
    >
      {$layout.editorVisible ? 'Close Editor' : 'Open Editor'}
    </button>
    {#if $layout.dataVisible && $selectedLayer}
      <DataTable
        data={$selectedLayer.data.geojson.features}
        tableName={$selectedLayer.displayName}
        onClose={onViewDataClose}
        class={[
          'absolute bottom-0 h-72 transition-all duration-400 ease-out',
          $layout.editorVisible ? 'w-2/3' : 'w-full'
        ]}
      />
    {/if}
  </div>
  {#if $layout.editorVisible}
    <Editor />
  {/if}
  {#if error.message}
    <div
      class="absolute bottom-12 left-4 rounded-md bg-slate-900 p-2 text-xs tracking-wider text-white shadow-lg"
    >
      <Alert kind="error" message="A map rendering error occurred." />
    </div>
  {/if}
</main>

<style lang="postcss">
  @reference 'tailwindcss';

  :global(#map .maplibregl-ctrl-attrib.maplibregl-compact) {
    @apply transition-transform duration-400 ease-out;
  }

  :global(#map.compact-y .maplibregl-ctrl-attrib.maplibregl-compact) {
    @apply -translate-y-72;
  }

  :global(#map.compact-x .maplibregl-ctrl-attrib.maplibregl-compact) {
    @apply -translate-x-[33.333333vw];
  }
</style>
