<script lang="ts">
  import { onDestroy, onMount, setContext } from 'svelte';
  import maplibregl from 'maplibre-gl';

  import { PUBLIC_MAPTILER_API_KEY } from '$env/static/public';
  import MaptilerBasemapGrid from '$lib/components/basemap/MaptilerBasemapGrid.svelte';
  import Modal from '$lib/components/shared/Modal.svelte';
  import Tabs, { type Tab } from '$lib/components/shared/Tabs.svelte';
  import { ir } from '$lib/stores/ir';
  import { map } from '$lib/stores/map';

  let picker: HTMLButtonElement;
  let maps: maplibregl.Map[] = [];
  let hovered = false;
  let showModal = false;

  const tabs: Tab[] = [{ name: 'MapTiler', content: MaptilerBasemapGrid }];
  const mapStyles = ['outdoor-v2', 'hybrid', 'toner-v2'];

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
  });

  onDestroy(() => {
    maps.forEach((map) => {
      map.remove();
    });
  });

  setContext('close-modal', () => {
    showModal = false;
  });

  function updateMapThumbnail(map: maplibregl.Map, node: HTMLButtonElement) {
    const { top, left } = node.getBoundingClientRect();
    map.setCenter($map.unproject([left + 32, top + 32]));
    map.setZoom($ir.zoom);
  }

  $: if (maps.length > 0 && $map && $ir) {
    updateMapThumbnail(maps[0], picker);
  }

  // Only update hidden map thumbnails when the picker is hovered.
  // This is a small perf optimization to avoid updating all three
  // thumbnails while two are out of view.
  $: if (hovered && $map && $ir) {
    maps.slice(1).forEach((map) => updateMapThumbnail(map, picker));
  }
</script>

<button
  class="group absolute bottom-4 left-4 z-10 shadow-lg"
  bind:this={picker}
  on:mouseenter={() => (hovered = true)}
  on:mouseleave={() => (hovered = false)}
  on:click={() => (showModal = true)}
>
  <div
    id={`inset-${mapStyles[0]}`}
    class="z-10 h-16 w-16 cursor-pointer rounded border-2 border-white"
  />
  <div
    id={`inset-${mapStyles[1]}`}
    class="absolute bottom-0 h-16 w-16 rounded border-2 border-white transition-transform group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:rotate-12"
    style="position: inherit;"
  />
  <div
    id={`inset-${mapStyles[2]}`}
    class="absolute bottom-0 h-16 w-16 rounded border-2 border-white transition-transform group-hover:-translate-x-2 group-hover:-translate-y-2 group-hover:-rotate-12"
    style="position: inherit;"
  />
</button>
<Modal bind:showModal class="max-w-3xl">
  <h2 slot="header" class="text-xl font-semibold">Select Basemap</h2>
  <Tabs {tabs} slot="body" class="mx-4 border-b border-b-slate-400" />
</Modal>
