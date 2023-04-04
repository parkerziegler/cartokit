<script lang="ts">
  import LayerEntry from '$lib/components/layers/LayerEntry.svelte';
  import { layers } from '$lib/stores/layers';
</script>

<ul class="stack stack-sm pt-4">
  {#each Object.values($layers) as layer}
    <LayerEntry {layer} />
  {/each}
</ul>
