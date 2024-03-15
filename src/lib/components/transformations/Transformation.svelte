<script lang="ts">
  import BufferTransformation from '$lib/components/transformations/BufferTransformation.svelte';
  import type { UserTransformation } from '$lib/types/transformation';

  export let transformation: UserTransformation;
</script>

<div class="rounded border border-gray-600 font-mono text-xs text-white">
  <p class="bg-gray-600 px-2 py-1">{transformation.type}</p>
  <div class="p-2">
    {#if transformation.type === 'Buffer'}
      <BufferTransformation {transformation} />
    {/if}
  </div>
</div>
