<script lang="ts">
  import { getContext } from 'svelte';
  import cs from 'classnames';

  import { ir } from '$lib/stores/ir';
  import { map } from '$lib/stores/map';
  import {
    BASEMAPS,
    TILE_URLS,
    type Basemap,
    type BasemapProvider
  } from '$lib/utils/basemap';
  import { switchBasemapWithPreservedLayers } from '$lib/utils/maplibre';

  export let provider: BasemapProvider;
  $: basemaps = BASEMAPS[provider];

  const closeModal = getContext<() => void>('close-modal');

  function onSelectBasemap(tileId: Basemap['tileId']) {
    return async function handleBasemapSelect() {
      const url = TILE_URLS[provider](tileId);

      ir.update((ir) => {
        ir.basemap.url = url;
        ir.basemap.provider = provider;

        return ir;
      });

      await switchBasemapWithPreservedLayers($map, $ir, url);
      closeModal();
    };
  }
</script>

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
        alt={`tiles-${basemap.tileId}`}
        class="rounded-sm"
      />
      <p class="mt-2 text-sm font-semibold">{basemap.title}</p>
    </button>
  {/each}
</div>
