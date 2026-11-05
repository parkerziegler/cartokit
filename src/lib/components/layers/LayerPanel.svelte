<script lang="ts">
  import { orderBy } from 'lodash-es';

  import LayerEntry from '$lib/components/layers/LayerEntry.svelte';
  import { ir } from '$lib/stores/ir';

  let layers = $derived(
    Object.values($ir.layers).filter((layer) => !layer.layout.deleted)
  );
</script>

{#if layers.length > 0}
  <ul class="flex flex-col gap-4 p-4 font-mono text-white">
    {#each orderBy(layers, 'layout.z', 'desc') as layer (layer.id)}
      <LayerEntry {layer} />
    {/each}
  </ul>
{/if}
