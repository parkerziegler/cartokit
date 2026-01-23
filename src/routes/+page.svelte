<script lang="ts">
  import maplibregl from 'maplibre-gl';
  import { onMount } from 'svelte';

  import type { PageData } from './$types';

  import Cursor from '$lib/components/cursor/Cursor.svelte';
  import Editor from '$lib/components/editor/Editor.svelte';
  import AddLayer from '$lib/components/layers/AddLayer.svelte';
  import LayerPanel from '$lib/components/layers/LayerPanel.svelte';
  import PropertiesMenu from '$lib/components/properties/PropertiesMenu.svelte';
  import Alert from '$lib/components/shared/Alert.svelte';
  import DataTable from '$lib/components/shared/DataTable.svelte';
  import Menu from '$lib/components/shared/Menu.svelte';
  import MenuTitle from '$lib/components/shared/MenuTitle.svelte';
  import Popup from '$lib/components/shared/Popup.svelte';
  import Toolbar from '$lib/components/toolbar/Toolbar.svelte';
  import { onFeatureLeave } from '$lib/interaction/select';
  import { chat } from '$lib/state/chat.svelte';
  import { diffs } from '$lib/state/diffs.svelte';
  import { initHistory } from '$lib/state/history.svelte';
  import { user } from '$lib/state/user.svelte';
  import { ir } from '$lib/stores/ir';
  import { layout } from '$lib/stores/layout';
  import { map as mapState } from '$lib/state/map.svelte';
  import { layer } from '$lib/state/layer.svelte';
  import { registerKeybinding } from '$lib/utils/keybinding';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let map = $state<maplibregl.Map>();
  let error = $state({ message: '' });
  let processingDiff = $state(false);

  // We intentionally capture the values of data.userId and data.enableChat
  // from the load function in +page.server.ts.
  //
  // svelte-ignore state_referenced_locally
  user.userId = data.userId;
  // svelte-ignore state_referenced_locally
  chat.enable = data.enableChat;

  onMount(() => {
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

    map.on('error', (err) => {
      console.error(err);
      error.message = 'A map rendering error occurred.';

      window.setTimeout(() => {
        error.message = '';
      }, 5000);
    });

    const destroyHistory = initHistory();

    const unregisterKeybinding = registerKeybinding(
      'e',
      toggleEditorVisibility
    );

    return () => {
      map?.remove();
      destroyHistory();
      unregisterKeybinding();
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

  $effect(() => {
    async function processDiff() {
      if (processingDiff) {
        return;
      }

      processingDiff = true;

      while (diffs.length) {
        const loggedDiff = diffs.shift();

        if (loggedDiff) {
          try {
            fetch('/diff', {
              method: 'POST',
              body: JSON.stringify({
                userId: user.userId,
                diff: loggedDiff,
                llmAvailable: chat.enable
              })
            });
          } catch (err) {
            console.error(err);
          }
        }
      }

      processingDiff = false;
    }

    // Only process diffs for the study sessions.
    if (diffs.length && user.userId) {
      processDiff();
    }
  });
</script>

<main class="absolute inset-0 overflow-hidden">
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
    {#if layer.value}
      <PropertiesMenu map={map!} layer={layer.value} />
    {/if}
    {#if map}
      <Toolbar {map} />
    {/if}
    <button
      class={[
        'ease-cubic-out absolute right-4 bottom-12 z-10 flex items-baseline gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm tracking-wider text-white shadow-lg transition-transform duration-400 disabled:cursor-not-allowed',
        {
          '-translate-y-72': $layout.dataVisible,
          '-translate-x-[33.333333vw]': $layout.editorVisible,
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
    {#if $layout.dataVisible && layer.value}
      <DataTable
        data={layer.value.data.geojson.features}
        tableName={layer.value.displayName}
        onClose={onViewDataClose}
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
      <Alert kind="error" message="A map rendering error occurred." />
    </div>
  {/if}
  <Cursor />
  <Popup />
</main>
