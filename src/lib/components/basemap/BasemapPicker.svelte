<script lang="ts">
  import maplibregl from 'maplibre-gl';
  import { onMount, setContext } from 'svelte';

  import { PUBLIC_MAPTILER_API_KEY } from '$env/static/public';
  import BasemapGrid from '$lib/components/basemap/BasemapGrid.svelte';
  import Modal from '$lib/components/shared/Modal.svelte';
  import Tabs from '$lib/components/shared/Tabs.svelte';
  import { ir } from '$lib/stores/ir';
  import { layout } from '$lib/stores/layout';
  import { map as mapStore } from '$lib/stores/map';
  import type { BasemapProvider } from '$lib/types';
  import { BASEMAPS } from '$lib/utils/basemap';

  let picker: HTMLButtonElement;
  let maps = $state<maplibregl.Map[]>([]);
  let hovered = $state(false);
  let showModal = $state(false);

  setContext('close-modal', () => {
    showModal = false;
  });

  const tabs = Object.keys(BASEMAPS).map((provider) => ({
    name: provider,
    content: BasemapGrid,
    props: { provider } as { provider: BasemapProvider }
  }));
  const mapStyles = ['outdoor-v2', 'winter-v2', 'satellite'];

  onMount(() => {
    maps = mapStyles.map((style) => {
      const map = new maplibregl.Map({
        container: `inset-${style}`,
        style: `https://api.maptiler.com/maps/${style}/style.json?key=${PUBLIC_MAPTILER_API_KEY}`,
        center: $ir.center,
        zoom: $ir.zoom
      });

      map.scrollZoom.disable();

      return map;
    });

    return () => {
      maps.forEach((map) => {
        map.remove();
      });
    };
  });

  function updateMapThumbnail(map: maplibregl.Map) {
    const { top, left } = picker.getBoundingClientRect();
    map.setCenter($mapStore.unproject([left + 32, top + 32]));
    map.setZoom($ir.zoom);
  }

  function onMouseEnter() {
    hovered = true;
  }

  function onMouseLeave() {
    hovered = false;
  }

  function onClick() {
    showModal = true;
  }

  $effect(() => {
    if (maps.length > 0 && $mapStore && $ir) {
      updateMapThumbnail(maps[0]);
    }
  });

  // Only update hidden map thumbnails when the picker is hovered.
  // This is a small perf optimization to avoid updating all three
  // thumbnails while two are out of view.
  $effect(() => {
    if (hovered && $mapStore && $ir) {
      maps.slice(1).forEach(updateMapThumbnail);
    }
  });
</script>

<button
  class="group absolute bottom-4 left-4 z-10 shadow-lg transition-transform duration-[400ms] ease-out"
  class:-translate-y-72={$layout.dataVisible}
  bind:this={picker}
  onmouseenter={onMouseEnter}
  onmouseleave={onMouseLeave}
  onclick={onClick}
  aria-label="Switch basemap"
>
  <div
    id="inset-{mapStyles[0]}"
    class="z-10 h-16 w-16 cursor-pointer rounded border-2 border-white"
  ></div>
  <div
    id="inset-{mapStyles[1]}"
    class="absolute bottom-0 h-16 w-16 rounded border-2 border-white transition-transform group-hover:-translate-y-2 group-hover:translate-x-2 group-hover:rotate-12"
    style="position: inherit;"
  ></div>
  <div
    id="inset-{mapStyles[2]}"
    class="absolute bottom-0 h-16 w-16 rounded border-2 border-white transition-transform group-hover:-translate-x-2 group-hover:-translate-y-2 group-hover:-rotate-12"
    style="position: inherit;"
  ></div>
</button>
<Modal bind:showModal class="max-w-2xl" initialHeight={277}>
  {#snippet header()}
    <h2 class="text-xl font-semibold">Select Basemap</h2>
  {/snippet}
  <Tabs {tabs} />
</Modal>
