<script lang="ts">
  import { orderBy } from 'lodash-es';

  import LayerEntry from '$lib/components/layers/LayerEntry.svelte';
  import { ir } from '$lib/state/ir.svelte';
</script>

{#if Object.keys(ir.value.layers).length > 0}
  <ul class="flex flex-col gap-4 p-4 font-mono text-white">
    {#each orderBy(Object.values(ir.value.layers), 'layout.z', 'desc') as layer (layer.id)}
      <LayerEntry {layer} />
    {/each}
  </ul>
{/if}
