<!-- <script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import maplibregl from 'maplibre-gl';

  import { PUBLIC_MAPTILER_API_KEY } from '$env/static/public';
  import { ir } from '$lib/stores/ir';
  import { MAPTILER_BASEMAPS, type Basemap } from '$lib/utils/basemap';

  interface BasemapSelection extends Basemap {
    map: maplibregl.Map;
  }

  let basemaps: BasemapSelection[] = [];

  onMount(() => {
    console.log($ir.center, $ir.zoom);

    const bms = MAPTILER_BASEMAPS.map((basemap) => {
      const map = new maplibregl.Map({
        container: `tiles-${basemap.tileId}`,
        style: `https://api.maptiler.com/maps/${basemap.tileId}/style.json?key=${PUBLIC_MAPTILER_API_KEY}`,
        center: [15, 35],
        zoom: 1
      });

      return { map, ...basemap };
    });

    basemaps = bms;
  });

  onDestroy(() => {
    basemaps.forEach(({ map }) => {
      map.remove();
    });
  });
</script>

<div class="grid grid-cols-3 gap-4">
  {#each MAPTILER_BASEMAPS as basemap}
    <div class="stack stack-sm">
      <div id={`tiles-${basemap.tileId}`} class="h-32" />
      <p>{basemap.title}</p>
    </div>
  {/each}
</div> -->
<script lang="ts">
  import { getContext } from 'svelte';

  import { PUBLIC_MAPTILER_API_KEY } from '$env/static/public';
  import { addSource } from '$lib/interaction/source';
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
    <button class="flex flex-col" on:click={onSelectBasemap(basemap.tileId)}>
      <img src={basemap.src} alt={`tiles-${basemap.tileId}`} class="h-32" />
      <p class="mt-2 text-sm font-semibold">{basemap.title}</p>
    </button>
  {/each}
</div>
