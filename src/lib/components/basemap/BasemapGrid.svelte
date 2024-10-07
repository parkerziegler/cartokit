<script lang="ts">
  import cs from 'classnames';
  import { getContext } from 'svelte';

  import CustomTiles from '$lib/components/basemap/CustomTiles.svelte';
  import { ir } from '$lib/stores/ir';
  import type { Basemap, BasemapProvider } from '$lib/types';
  import { BASEMAPS, TILE_URLS } from '$lib/utils/basemap';
  import { switchBasemapWithPreservedLayers } from '$lib/utils/maplibre';

  export let provider: BasemapProvider;
  const closeModal = getContext<() => void>('close-modal');

  $: basemaps = BASEMAPS[provider];

  function onSelectBasemap(tileId: Basemap['tileId']) {
    return function updateBasemap() {
      const tileUrl = TILE_URLS[provider](tileId);

      switchBasemapWithPreservedLayers(tileUrl, provider);
      closeModal();
    };
  }
</script>

{#if provider === 'Custom'}
  <CustomTiles />
{:else}
  <div class="grid grid-cols-3 gap-4">
    {#each basemaps as basemap}
      <button
        class={cs(
          'flex flex-col rounded border p-2 transition-colors hover:border-slate-400',
          TILE_URLS[provider](basemap.tileId) === $ir.basemap.url
            ? 'border-slate-400'
            : 'border-transparent'
        )}
        on:click={onSelectBasemap(basemap.tileId)}
      >
        <img
          src={basemap.src}
          alt="tiles-{basemap.tileId}"
          class="rounded-sm"
        />
        <p class="mt-2 text-sm font-semibold">{basemap.title}</p>
      </button>
    {/each}
  </div>
{/if}
