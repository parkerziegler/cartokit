<script lang="ts">
  import { snakeCase, uniqueId } from 'lodash-es';
  import type { MapSourceDataEvent } from 'maplibre-gl';
  import { getContext } from 'svelte';

  import LineIcon from '$lib/components/icons/LineIcon.svelte';
  import PointIcon from '$lib/components/icons/PointIcon.svelte';
  import PolygonIcon from '$lib/components/icons/PolygonIcon.svelte';
  import { applyDiff } from '$lib/core/diff';
  import { map } from '$lib/state/map.svelte';
  import type { CartoKitSource, GalleryItem } from '$lib/types';
  import { GALLERY_ITEMS } from '$lib/utils/gallery';

  const closeModal = getContext<() => void>('close-modal');

  let loadingId: string | null = $state(null);

  function handleSourceLoaded(layerId: string) {
    return (event: MapSourceDataEvent) => {
      if (event.sourceId === layerId) {
        loadingId = null;
        closeModal();
        map.value!.off('sourcedata', handleSourceLoaded(layerId));
      }
    };
  }

  async function onSelectDataset(item: GalleryItem) {
    loadingId = item.id;

    const layerId = uniqueId(`${snakeCase(item.name)}__`);
    const payload = {
      type: item.format,
      displayName: item.name,
      location: {
        type: 'api' as const,
        url: item.url
      }
    };

    await applyDiff({
      type: 'add-layer',
      layerId,
      payload
    });

    map.value!.on('sourcedata', handleSourceLoaded(layerId));
  }

  function formatToDisplay(format: CartoKitSource['type']) {
    switch (format) {
      case 'geojson':
        return 'GeoJSON';
      case 'geoparquet':
        return 'GeoParquet';
      case 'pmtiles':
        return 'PMTiles';
    }
  }
</script>

<div
  class="grid h-full w-[min(80vw,64rem)] grid-cols-3 gap-x-2 gap-y-1 lg:grid-cols-4"
>
  {#each GALLERY_ITEMS as item (item.id)}
    <button
      onclick={() => onSelectDataset(item)}
      disabled={loadingId !== null}
      class={[
        'relative flex flex-col gap-1 rounded-sm border p-2 text-left transition-colors hover:border-slate-400',
        loadingId === item.id ? 'border-slate-400' : 'border-transparent'
      ]}
    >
      {#if loadingId === item.id}
        <div class="absolute inset-0 z-10 rounded-sm bg-white/20">
          <span
            class="loader absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          ></span>
        </div>
      {/if}
      <enhanced:img src={item.src} alt={item.name} class="rounded-xs" />
      <div class="mt-2 flex items-center justify-between gap-1">
        <p class="text-xs font-semibold">{item.name}</p>
        <span class="shrink-0">
          {#if item.type === 'Line'}
            <LineIcon />
          {:else if item.type === 'Point'}
            <PointIcon />
          {:else if item.type === 'Polygon'}
            <PolygonIcon />
          {/if}
        </span>
      </div>
      <div class="text-2xs flex items-start justify-between gap-2 font-light">
        <p class="text-slate-400">
          {item.attribution}
        </p>
        <p class="rounded-xs bg-slate-700 px-1 py-0.5 font-mono">
          {formatToDisplay(item.format)}
        </p>
      </div>
    </button>
  {/each}
</div>

<style lang="postcss">
  @reference 'tailwindcss';

  .loader {
    @apply relative inline-block h-8 w-8;
  }
  .loader::after,
  .loader::before {
    @apply absolute top-0 left-0 h-8 w-8 rounded-full bg-slate-400;
    content: '';
    animation: animloader 0.5s ease-in-out infinite;
  }

  @keyframes animloader {
    0% {
      transform: scale(0);
      opacity: 1;
    }

    100% {
      transform: scale(1);
      opacity: 0;
    }
  }
</style>
