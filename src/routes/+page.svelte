<script lang="ts">
  import { type Feature } from 'geojson';
  import maplibregl from 'maplibre-gl';
  import * as pmtiles from 'pmtiles';
  import { onMount } from 'svelte';

  import type { PageData } from './$types';

  import Cursor from '$lib/components/cursor/Cursor.svelte';
  import Editor from '$lib/components/editor/Editor.svelte';
  import AddLayer from '$lib/components/layers/AddLayer.svelte';
  import LayerPanel from '$lib/components/layers/LayerPanel.svelte';
  import PropertiesMenu from '$lib/components/properties/PropertiesMenu.svelte';
  import Alert from '$lib/components/shared/Alert.svelte';
  import AlertIcon from '$lib/components/icons/AlertIcon.svelte';
  import DataTable from '$lib/components/shared/DataTable.svelte';
  import Menu from '$lib/components/shared/Menu.svelte';
  import MenuTitle from '$lib/components/shared/MenuTitle.svelte';
  import Popup from '$lib/components/shared/Popup.svelte';
  import Toolbar from '$lib/components/toolbar/Toolbar.svelte';
  import { onFeatureLeave } from '$lib/interaction/select';
  import { chat } from '$lib/state/chat.svelte';
  import { error } from '$lib/state/error.svelte';
  import { initHistory } from '$lib/state/history.svelte';
  import { layerId } from '$lib/state/layerId.svelte';
  import { user } from '$lib/state/user.svelte';
  import { map as mapState } from '$lib/state/map.svelte';
  import { ir } from '$lib/stores/ir';
  import { layout } from '$lib/stores/layout';
  import { registerKeybinding } from '$lib/utils/keybinding';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let map = $state<maplibregl.Map>();
  let features = $state<Feature[]>([]);
  let table = $derived.by<{ columns: string[]; rows: Feature[] }>(() => {
    if (layerId.value) {
      const layer = $ir.layers[layerId.value];

      switch (layer.source.type) {
        case 'geojson': {
          return {
            rows: layer.source.data.features,
            columns: Object.keys(
              layer.source.data.features[0]?.properties ?? {}
            )
          };
        }
        case 'vector': {
          return {
            rows:
              features.length > 0
                ? features
                : (map?.queryRenderedFeatures({
                    layers: [layer.id]
                  }) ?? []),
            columns: Object.keys(
              layer.source.vector_layers[layer.source.sourceLayerIndex].fields
            )
          };
        }
        default:
          return { columns: [], rows: [] };
      }
    } else {
      return { columns: [], rows: [] };
    }
  });

  // We intentionally capture the values of data.userId and data.enableChat
  // from the load function in +page.server.ts.
  //
  // svelte-ignore state_referenced_locally
  user.userId = data.userId;
  // svelte-ignore state_referenced_locally
  chat.enable = data.enableChat;

  onMount(() => {
    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);

    map = new maplibregl.Map({
      container: 'map',
      style: data.basemap.url,
      center: $ir.center,
      zoom: $ir.zoom
    });

    // Add an event listener to handle feature deselection.
    map.on('click', onFeatureLeave(map, $ir.layers));

    // When the map first reaches an idle state, set it in the store.
    // This should ensure that the map's styles and data have fully loaded.
    map.once('idle', (e) => {
      mapState.value = e.target;

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

    map.on('style.load', (event) => {
      event.target.setProjection({ type: $ir.projection });
    });

    // Add an idle listener that will update features in the data table when a
    // vector layer is active. GeoJSON layers store data in memory, so we just
    // read directly from the IR.
    map.on('idle', (e) => {
      const currentLayer = layerId.value
        ? $ir.layers[layerId.value]
        : undefined;

      if (currentLayer?.source.type === 'vector') {
        features = e.target.queryRenderedFeatures({
          layers: [currentLayer.id]
        });
      }
    });

    map.on('error', (err) => {
      console.error(err);
      error.set('A map rendering error occurred.');
    });

    const destroyHistory = initHistory();
    const deregisterKeybinding = registerKeybinding(
      'e',
      toggleEditorVisibility
    );

    return () => {
      map?.remove();
      destroyHistory();
      deregisterKeybinding();
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

<main class="absolute inset-0 overflow-hidden dark:bg-black">
  <div
    class={[
      'maplibregl-map relative h-full w-full',
      {
        'compact-y': $layout.dataVisible,
        'compact-x': $layout.editorVisible
      }
    ]}
    id="map"
  >
    <Menu class="absolute top-4 left-4 z-10 max-w-sm overflow-auto">
      <MenuTitle class="mr-4">
        Layers
        {#snippet action()}
          <AddLayer />
        {/snippet}
      </MenuTitle>
      <LayerPanel />
    </Menu>
    {#if layerId.value}
      <PropertiesMenu layer={$ir.layers[layerId.value]} />
    {/if}
    {#if map}
      <Toolbar {map} />
    {/if}
    <button
      class={[
        'ease-cubic-out absolute right-4 bottom-12 z-10 flex items-baseline gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm tracking-wider text-white shadow-lg transition-transform duration-400 disabled:cursor-not-allowed',
        {
          '-translate-y-72': $layout.dataVisible,
          'translate-x-[-33.333333vw]': $layout.editorVisible,
          'delay-150': !$layout.editorVisible
        }
      ]}
      onclick={toggleEditorVisibility}
      disabled={!mapState.value}
      data-testid="editor-toggle"
    >
      {$layout.editorVisible ? 'Close Editor' : 'Open Editor'}
      <span class="text-slate-400">E</span>
    </button>
    {#if $layout.dataVisible && layerId.value}
      {@const layer = $ir.layers[layerId.value]}
      <DataTable
        rows={table.rows}
        columns={table.columns}
        tableName={layer.displayName}
        onClose={onViewDataClose}
        sourceType={layer.source.type}
        class={[
          'ease-cubic-out absolute bottom-0 h-72 transition-all duration-400',
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
      <Alert kind="error" message={error.message}>
        {#snippet icon()}
          <AlertIcon />
        {/snippet}
      </Alert>
    </div>
  {/if}
  <Cursor />
  <Popup />
</main>
