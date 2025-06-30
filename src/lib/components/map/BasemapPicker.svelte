<script lang="ts">
  import maplibregl from 'maplibre-gl';
  import { onMount, setContext } from 'svelte';

  import { PUBLIC_MAPTILER_API_KEY } from '$env/static/public';
  import BasemapGrid from '$lib/components/map/BasemapGrid.svelte';
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
    map.setCenter($mapStore.unproject([left + 20, top + 20]));
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

  let timeoutId = $state<number | null>(null);

  layout.subscribe(() => {
    if (maps.length > 0 && $mapStore && $ir) {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        updateMapThumbnail(maps[0]);
      }, 400);
    }
  });
</script>

<button
  class="group relative"
  bind:this={picker}
  onmouseenter={onMouseEnter}
  onmouseleave={onMouseLeave}
  onclick={onClick}
  aria-label="Switch basemap"
>
  <div
    id="inset-{mapStyles[0]}"
    class="z-10 h-10 w-10 cursor-pointer rounded-sm border border-white"
  ></div>
  <div
    id="inset-{mapStyles[1]}"
    class="!absolute inset-0 h-10 w-10 rounded-sm border border-white transition-transform group-hover:translate-x-2 group-hover:rotate-12"
  ></div>
  <div
    id="inset-{mapStyles[2]}"
    class="!absolute inset-0 h-10 w-10 rounded-sm border border-white transition-transform group-hover:-translate-x-2 group-hover:-rotate-12"
  ></div>
</button>
<Modal bind:showModal class="max-w-2xl" initialHeight={277}>
  {#snippet header()}
    <h2 class="text-xl font-semibold">Select Basemap</h2>
  {/snippet}
  <Tabs {tabs} />
</Modal>

<style lang="postcss">
  @reference 'tailwindcss';

  /* Basemap Inset */
  :global([id^='inset'] .maplibregl-ctrl-bottom-right) {
    @apply hidden;
  }

  :global([id^='inset'] .maplibregl-canvas-container.maplibregl-interactive) {
    @apply cursor-pointer;
  }
</style>
