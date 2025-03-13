<script lang="ts">
  import cs from 'classnames';
  import * as Comlink from 'comlink';
  import maplibregl from 'maplibre-gl';
  import { onMount } from 'svelte';

  import type { PageData } from './$types';

  import BasemapPicker from '$lib/components/basemap/BasemapPicker.svelte';
  import Editor from '$lib/components/editor/Editor.svelte';
  import AddLayer from '$lib/components/layers/AddLayer.svelte';
  import LayerPanel from '$lib/components/layers/LayerPanel.svelte';
  import PropertiesMenu from '$lib/components/properties/PropertiesMenu.svelte';
  import DataTable from '$lib/components/shared/DataTable.svelte';
  import Menu from '$lib/components/shared/Menu.svelte';
  import MenuTitle from '$lib/components/shared/MenuTitle.svelte';
  import { onFeatureLeave } from '$lib/interaction/select';
  import { env as envStore } from '$lib/stores/env';
  import { ir } from '$lib/stores/ir';
  import { layout } from '$lib/stores/layout';
  import { map as mapStore } from '$lib/stores/map';
  import { selectedLayer } from '$lib/stores/selected-layer';
  import type { CartoKitIR, VercelEnv } from '$lib/types';

  export let data: PageData;

  let map: maplibregl.Map;
  let codegenWorker: Worker;
  let codegen:
    | ((
        ir: CartoKitIR,
        vercelEnv: VercelEnv,
        playwrightWorkflowId?: string
      ) => Promise<string>)
    | null;
  let program = '';
  let programId = '';

  onMount(() => {
    // maplibre-gl is actually a CJS module, and not all module.exports may be
    // supported as named exports.
    // eslint-disable-next-line import/no-named-as-default-member
    map = new maplibregl.Map({
      container: 'map',
      style: data.basemap.url,
      center: $ir.center,
      zoom: $ir.zoom
    });
    codegenWorker = new Worker(
      new URL('$lib/codegen/index.ts', import.meta.url),
      {
        type: 'module'
      }
    );
    codegen =
      Comlink.wrap<
        (
          ir: CartoKitIR,
          vercelEnv: VercelEnv,
          playwrightWorkflowId?: string
        ) => Promise<string>
      >(codegenWorker);
    envStore.set(data.env);

    // Add an event listener to handle feature deselection.
    map.on('click', onFeatureLeave(map, $ir));

    // When the map first reaches an idle state, set it in the store.
    // This should ensure that the map's styles and data have fully loaded.
    map.once('idle', async () => {
      mapStore.set(map);

      ir.update((ir) => {
        ir.basemap.url = data.basemap.url;
        ir.basemap.provider = data.basemap.provider;

        return ir;
      });
    });

    map.on('idle', () => {
      if ($mapStore && window.programId && window.programId !== programId) {
        performance.mark('reconciliation-idle-end');
        const { duration } = performance.measure(
          'reconciliation-idle',
          'reconciliation-start',
          'reconciliation-idle-end'
        );
        console.log('recon-ttq', duration, window.programId);
        programId = window.programId;
      }
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
      codegenWorker.terminate();
      codegen = null;
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

  $: if (codegen) {
    codegen($ir, data.env)
      .then((code) => {
        program = code;
      })
      .catch((err) => {
        console.error(err);
      });
  }
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
      <PropertiesMenu {map} layer={$selectedLayer} />
    {/if}
    <BasemapPicker />
    <button
      class={cs(
        'absolute bottom-12 right-4 z-10 rounded-md bg-slate-900 px-3 py-2 text-sm tracking-wider text-white shadow-lg transition-transform duration-[400ms] ease-out disabled:cursor-not-allowed',
        {
          '-translate-y-72': $layout.dataVisible,
          '-translate-x-[33.333333vw]': $layout.editorVisible
        }
      )}
      on:click={toggleEditorVisibility}
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
        class={cs(
          'absolute bottom-0 h-72 transition-all duration-[400ms] ease-out',
          $layout.editorVisible ? 'w-2/3' : 'w-full'
        )}
      />
    {/if}
  </div>
  {#if $layout.editorVisible}
    <Editor {program} />
  {/if}
</main>

<style lang="postcss">
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
