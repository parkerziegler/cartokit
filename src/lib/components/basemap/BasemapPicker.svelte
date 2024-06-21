<script lang="ts">
  import maplibregl from 'maplibre-gl';
  import { onMount, setContext } from 'svelte';

  // eslint-disable-next-line import/no-unresolved
  import { PUBLIC_MAPTILER_API_KEY } from '$env/static/public';
  import BasemapGrid from '$lib/components/basemap/BasemapGrid.svelte';
  import Modal from '$lib/components/shared/Modal.svelte';
  import Tabs, { type Tab } from '$lib/components/shared/Tabs.svelte';
  import { ir } from '$lib/stores/ir';
  import { layout } from '$lib/stores/layout';
  import { map as mapStore } from '$lib/stores/map';
  import { BASEMAPS, type BasemapProvider } from '$lib/utils/basemap';

  let picker: HTMLButtonElement;
  let maps: maplibregl.Map[] = [];
  let hovered = false;
  let showModal = false;

  setContext('close-modal', () => {
    showModal = false;
  });

  const tabs: Tab<{ provider: BasemapProvider }>[] = Object.keys(BASEMAPS).map(
    (provider) => {
      return {
        name: provider,
        content: BasemapGrid,
        props: { provider: provider as BasemapProvider }
      };
    }
  );
  const mapStyles = ['outdoor-v2', 'winter-v2', 'satellite'];

  onMount(() => {
    maps = mapStyles.map((style) => {
      // maplibre-gl is actually a CJS module, and not all module.exports may be
      // supported as named exports.
      // eslint-disable-next-line import/no-named-as-default-member
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

  const updateMapThumbnail = (map: maplibregl.Map, node: HTMLButtonElement) => {
    const { top, left } = node.getBoundingClientRect();
    map.setCenter($mapStore.unproject([left + 32, top + 32]));
    map.setZoom($ir.zoom);
  };

  const onMouseEnter = () => {
    hovered = true;
  };

  const onMouseLeave = () => {
    hovered = false;
  };

  const onClick = () => {
    showModal = true;
  };

  $: if (maps.length > 0 && $mapStore && $ir) {
    updateMapThumbnail(maps[0], picker);
  }

  // Only update hidden map thumbnails when the picker is hovered.
  // This is a small perf optimization to avoid updating all three
  // thumbnails while two are out of view.
  $: if (hovered && $mapStore && $ir) {
    maps.slice(1).forEach((map) => updateMapThumbnail(map, picker));
  }
</script>

<button
  class="group absolute bottom-4 left-4 z-10 shadow-lg transition-transform duration-[400ms] ease-out"
  class:-translate-y-72={$layout.dataVisible}
  bind:this={picker}
  on:mouseenter={onMouseEnter}
  on:mouseleave={onMouseLeave}
  on:click={onClick}
>
  <div
    id={`inset-${mapStyles[0]}`}
    class="z-10 h-16 w-16 cursor-pointer rounded border-2 border-white"
  />
  <div
    id={`inset-${mapStyles[1]}`}
    class="absolute bottom-0 h-16 w-16 rounded border-2 border-white transition-transform group-hover:-translate-y-2 group-hover:translate-x-2 group-hover:rotate-12"
    style="position: inherit;"
  />
  <div
    id={`inset-${mapStyles[2]}`}
    class="absolute bottom-0 h-16 w-16 rounded border-2 border-white transition-transform group-hover:-translate-x-2 group-hover:-translate-y-2 group-hover:-rotate-12"
    style="position: inherit;"
  />
</button>
<Modal bind:showModal class="max-w-2xl" initialHeight={277}>
  <h2 slot="header" class="text-xl font-semibold">Select Basemap</h2>
  <Tabs {tabs} slot="body" />
</Modal>
