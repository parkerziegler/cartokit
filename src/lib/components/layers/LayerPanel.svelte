<script lang="ts">
  import LayerEntry from '$lib/components/layers/LayerEntry.svelte';
  import { ir } from '$lib/stores/ir';
</script>

{#if Object.keys($ir.layers).length > 0}
  <ul class="flex flex-col gap-4 p-4 font-mono text-white">
    {#each Object.values($ir.layers) as layer (layer.id)}
      <LayerEntry {layer} />
    {/each}
  </ul>
{/if}
