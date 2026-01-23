<script lang="ts">
  import { getContext } from 'svelte';
  import { uniqueId, kebabCase } from 'lodash-es';
  import type { MapSourceDataEvent } from 'maplibre-gl';

  import { GALLERY_ITEMS } from '$lib/utils/gallery';
  import { applyDiff } from '$lib/core/diff';
  import { map } from '$lib/state/map.svelte';
  import ChoroplethIcon from '$lib/components/icons/ChoroplethIcon.svelte';
  import DotDensityIcon from '$lib/components/icons/DotDensityIcon.svelte';
  import HeatmapIcon from '$lib/components/icons/HeatmapIcon.svelte';
  import LineIcon from '$lib/components/icons/LineIcon.svelte';
  import PointIcon from '$lib/components/icons/PointIcon.svelte';
  import PolygonIcon from '$lib/components/icons/PolygonIcon.svelte';
  import ProportionalSymbolIcon from '$lib/components/icons/ProportionalSymbolIcon.svelte';


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

  async function onSelectDataset(itemId: string, displayName: string, url: string) {
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
        'flex flex-col rounded-sm border p-2 transition-colors hover:border-slate-400 text-left',
        loadingId === item.id ? 'border-slate-400' : 'border-transparent'
      ]}
    >
      <enhanced:img
        src={item.src}
        alt={item.name}
        class="rounded-xs"
      />
       <div class="mt-2 flex items-center justify-between">
        <p class="text-sm font-semibold">{item.name}</p>
        <span class="shrink-0">
          {#if item.type === 'Choropleth'}
            <ChoroplethIcon />
          {:else if item.type === 'Dot Density'}
            <DotDensityIcon />
          {:else if item.type === 'Heatmap'}
            <HeatmapIcon />
          {:else if item.type === 'Line'}
            <LineIcon />
          {:else if item.type === 'Point'}
            <PointIcon />
          {:else if item.type === 'Polygon'}
            <PolygonIcon />
          {:else if item.type === 'Proportional Symbol'}
            <ProportionalSymbolIcon />
          {/if}
        </span>
      </div>
      <p class="mt-0 text-xs font-light text-gray-500">{item.attribution}</p>

    </button>
  {/each}
</div>
