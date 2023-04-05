<script lang="ts">
  import LayerEntry from '$lib/components/layers/LayerEntry.svelte';
  import { layers } from '$lib/stores/layers';
</script>

<ul class="stack stack-sm p-4 font-mono text-white">
  {#each Object.values($layers) as layer}
    <LayerEntry {layer} />
  {/each}
</ul>
