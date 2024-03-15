<script lang="ts">
  import AddTransformation from '$lib/components/transformations/AddTransformation.svelte';
  import Transformation from '$lib/components/transformations/Transformation.svelte';
  import { ir } from '$lib/stores/ir';
</script>

<div class="stack stack-sm w-full">
  {#each $ir.transformations as transformation}
    <Transformation {transformation} />
  {/each}
  <AddTransformation />
</div>
