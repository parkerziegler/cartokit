<script lang="ts">
  import { orderBy } from 'lodash-es';

  import LayerEntry from '$lib/components/layers/LayerEntry.svelte';
  import { ir } from '$lib/stores/ir';
</script>

{#if Object.values($ir.layers).some((layer) => !layer.layout.deleted)}
  <ul class="flex flex-col gap-4 p-4 font-mono text-white">
    {#each orderBy( Object.values($ir.layers).filter((layer) => !layer.layout.deleted), 'layout.z', 'desc' ) as layer (layer.id)}
      <LayerEntry {layer} />
    {/each}
  </ul>
{/if}
