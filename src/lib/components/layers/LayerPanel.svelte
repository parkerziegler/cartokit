<script lang="ts">
  import { layers } from '$lib/stores/layers';
</script>

<ul class="pt-4">
  {#each Object.values($layers) as layer}
    <li>{layer.displayName}</li>
  {/each}
</ul>
