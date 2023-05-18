<script lang="ts">
  import { getContext } from 'svelte';

  import { PUBLIC_MAPTILER_API_KEY } from '$env/static/public';
  import { ir } from '$lib/stores/ir';
  import { map } from '$lib/stores/map';
  import { MAPTILER_BASEMAPS, type Basemap } from '$lib/utils/basemap';
  import { switchBasemapWithPreservedLayers } from '$lib/utils/maplibre';

  const closeModal = getContext<() => void>('close-modal');

  function onSelectBasemap(tileId: Basemap['tileId']) {
    return async function handleBasemapSelect() {
      const url = `https://api.maptiler.com/maps/${tileId}/style.json?key=${PUBLIC_MAPTILER_API_KEY}`;

      ir.update((ir) => {
        ir.basemap.url = url;
        ir.basemap.provider = 'Maptiler';

        return ir;
      });

      await switchBasemapWithPreservedLayers($map, $ir, url);
      closeModal();
    };
  }
</script>

<div class="grid grid-cols-3 gap-4">
  {#each MAPTILER_BASEMAPS as basemap}
    <button
      class="flex flex-col rounded-lg border border-transparent p-2 transition-colors hover:border-slate-400"
      on:click={onSelectBasemap(basemap.tileId)}
    >
      <img
        src={basemap.src}
        alt={`tiles-${basemap.tileId}`}
        class="h-32 w-auto rounded-xl"
      />
      <p class="mt-2 text-sm font-semibold">{basemap.title}</p>
    </button>
  {/each}
</div>
