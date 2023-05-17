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

  onMount(() => {
    const outdoorMap = new maplibregl.Map({
      container: 'inset-outdoor',
      style: `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${PUBLIC_MAPTILER_API_KEY}`,
      center: $ir.center,
      zoom: $ir.zoom
    });

    const satelliteMap = new maplibregl.Map({
      container: 'inset-satellite',
      style: `https://api.maptiler.com/maps/hybrid/style.json?key=${PUBLIC_MAPTILER_API_KEY}`,
      center: $ir.center,
      zoom: $ir.zoom
    });

    const tonerMap = new maplibregl.Map({
      container: 'inset-toner',
      style: `https://api.maptiler.com/maps/toner-v2/style.json?key=${PUBLIC_MAPTILER_API_KEY}`,
      center: $ir.center,
      zoom: $ir.zoom
    });

    maps = [outdoorMap, satelliteMap, tonerMap];
    maps.forEach((map) => {
      map.scrollZoom.disable();
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

  $: if (maps.length > 0 && picker && $map && $ir) {
    updateMapThumbnail(maps[0], picker);
  }

  // Only update hidden map thumbnails when the picker is hovered.
  // This is a small perf optimization to avoid updating all three
  // thumbnails while two are out of view.
  $: if (hovered) {
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
  <div id="inset-outdoor" class="z-10 h-16 w-16 cursor-pointer rounded" />
  <div
    id="inset-satellite"
    class="absolute bottom-0 h-16 w-16 rounded transition-transform group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:rotate-12"
  />
  <div
    id="inset-toner"
    class="absolute bottom-0 h-16 w-16 rounded transition-transform group-hover:-translate-x-2 group-hover:-translate-y-2 group-hover:-rotate-12"
  />
</button>
<Modal bind:showModal class="max-w-3xl">
  <h2 slot="header" class="text-xl font-semibold">Select Basemap</h2>
  <Tabs {tabs} slot="body" class="mx-4 border-b border-b-slate-400" />
</Modal>
