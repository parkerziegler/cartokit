<script lang="ts">
  import { getContext } from 'svelte';
  import { uniqueId, kebabCase } from 'lodash-es';
  import type { MapSourceDataEvent } from 'maplibre-gl';

  import LineIcon from '$lib/components/icons/LineIcon.svelte';
  import PointIcon from '$lib/components/icons/PointIcon.svelte';
  import PolygonIcon from '$lib/components/icons/PolygonIcon.svelte';
  import { applyDiff } from '$lib/core/diff';
  import { map } from '$lib/state/map.svelte';
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

  async function onSelectDataset(
    itemId: string,
    displayName: string,
    url: string
  ) {
    loadingId = itemId;

    const layerId = uniqueId(`${kebabCase(displayName)}__`);

    await applyDiff({
      type: 'add-layer',
      layerId,
      payload: {
        type: 'api',
        displayName,
        url
      }
    });

    map.value!.on('sourcedata', handleSourceLoaded(layerId));
  }
</script>

<div class="grid grid-cols-2 gap-4">
  {#each GALLERY_ITEMS as item (item.id)}
    <button
      onclick={() => onSelectDataset(item.id, item.name, item.url)}
      disabled={loadingId !== null}
      class={[
        'relative flex flex-col rounded-sm border p-2 text-left transition-colors hover:border-slate-400',
        loadingId === item.id ? 'border-slate-400' : 'border-transparent'
      ]}
    >
      {#if loadingId === item.id}
        <div class="absolute inset-0 z-10 bg-white/10">
          <span
            class="loader absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          ></span>
        </div>
      {/if}
      <enhanced:img src={item.src} alt={item.name} class="rounded-xs" />
      <div class="mt-2 flex items-center justify-between">
        <p class="text-sm font-semibold">{item.name}</p>
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
      <p class="mt-0 text-xs font-light text-gray-500">{item.attribution}</p>
    </button>
  {/each}
</div>

<style lang="postcss">
  @reference 'tailwindcss';

  .loader {
    @apply relative inline-block h-4 w-4;
  }
  .loader::after,
  .loader::before {
    @apply absolute top-0 left-0 h-4 w-4 rounded-full bg-slate-400;
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
