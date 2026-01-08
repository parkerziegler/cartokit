<script lang="ts">
  import maplibregl from 'maplibre-gl';
  import { onMount, setContext } from 'svelte';

  import { PUBLIC_MAPTILER_API_KEY } from '$env/static/public';
  import { tooltip } from '$lib/attachments/tooltip';
  import BasemapGrid from '$lib/components/map/BasemapGrid.svelte';
  import Modal from '$lib/components/shared/Modal.svelte';
  import Tabs from '$lib/components/shared/Tabs.svelte';
  import { ir } from '$lib/stores/ir';
  import { layout } from '$lib/stores/layout';
  import type { BasemapProvider } from '$lib/types';
  import { BASEMAPS } from '$lib/utils/basemap';
  import { registerKeybinding } from '$lib/utils/keybinding';

  interface Props {
    map: maplibregl.Map;
  }

  let { map }: Props = $props();

  let picker: HTMLButtonElement;
  let thumbnails = $state<maplibregl.Map[]>([]);
  let showModal = $state(false);
  let timeoutId = $state<number | null>(null);

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
    const { top, left } = picker.getBoundingClientRect();

    thumbnails = mapStyles.map((style) => {
      const thumbnail = new maplibregl.Map({
        container: `inset-${style}`,
        style: `https://api.maptiler.com/maps/${style}/style.json?key=${PUBLIC_MAPTILER_API_KEY}`,
        center: map.unproject([left + 20, top + 20]),
        zoom: $ir.zoom
      });

      thumbnail.scrollZoom.disable();

      return thumbnail;
    });

    map.on('move', (event) =>
      updateMapThumbnailCenter(event.target, thumbnails[0])
    );
    map.on('zoom', (event) =>
      updateMapThumbnailZoom(event.target, thumbnails[0])
    );

    const unregisterKeybinding = registerKeybinding('b', onClick);

    return () => {
      thumbnails.forEach((thumbnail) => {
        thumbnail.remove();
      });

      unregisterKeybinding();
      map.off('move', (event) =>
        updateMapThumbnailCenter(event.target, thumbnails[0])
      );
      map.off('zoom', (event) =>
        updateMapThumbnailZoom(event.target, thumbnails[0])
      );
    };
  });

  function updateMapThumbnailCenter(
    map: maplibregl.Map,
    thumbnail: maplibregl.Map
  ) {
    const { top, left } = picker.getBoundingClientRect();
    thumbnail.setCenter(map.unproject([left + 20, top + 20]));
  }

  function updateMapThumbnailZoom(
    map: maplibregl.Map,
    thumbnail: maplibregl.Map
  ) {
    thumbnail.setZoom(map.getZoom());
  }

  function onClick() {
    showModal = true;
  }

  layout.subscribe(() => {
    if (thumbnails.length > 0) {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        updateMapThumbnailCenter(map, thumbnails[0]);
      }, 400);
    }
  });
</script>

<button
  class="group relative"
  bind:this={picker}
  onclick={onClick}
  aria-label="Switch basemap"
  {@attach tooltip({
    content: 'Basemap',
    keybinding: 'B',
    offsetValue: 12
  })}
>
  <div
    id="inset-{mapStyles[0]}"
    class="z-10 h-10 w-10 cursor-pointer rounded-sm border border-white"
  ></div>
  <div
    id="inset-{mapStyles[1]}"
    class="absolute! inset-0 h-10 w-10 rounded-sm border border-white transition-transform group-hover:translate-x-2 group-hover:rotate-12"
  ></div>
  <div
    id="inset-{mapStyles[2]}"
    class="absolute! inset-0 h-10 w-10 rounded-sm border border-white transition-transform group-hover:-translate-x-2 group-hover:-rotate-12"
  ></div>
</button>
<Modal bind:showModal class="max-w-2xl" initialHeight={277}>
  {#snippet header()}
    <h2 class="text-xl font-semibold">Select Basemap</h2>
  {/snippet}
  <Tabs {tabs} bodyClass="max-h-[24rem] overflow-y-auto" />
</Modal>

<style lang="postcss">
  @reference 'tailwindcss';

  /* Hide controls on inset maps. */
  :global([id^='inset'] .maplibregl-ctrl-bottom-right) {
    @apply hidden;
  }

  /* Indicate that inset maps are clickable to open the BasemapGrid. */
  :global([id^='inset'] .maplibregl-canvas-container.maplibregl-interactive) {
    @apply cursor-pointer;
  }
</style>
