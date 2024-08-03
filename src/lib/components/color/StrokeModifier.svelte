<script lang="ts">
  import MinusIcon from '$lib/components/icons/MinusIcon.svelte';
  import PlusIcon from '$lib/components/icons/PlusIcon.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { ConstantStroke } from '$lib/types';

  export let layerId: string;
  export let stroke: ConstantStroke | undefined;

  function onRemoveStroke() {
    dispatchLayerUpdate({
      type: 'remove-stroke',
      layerId,
      payload: {}
    });
  }

  function onAddStroke() {
    dispatchLayerUpdate({
      type: 'add-stroke',
      layerId,
      payload: {}
    });
  }
</script>

{#if stroke}
  <button on:click={onRemoveStroke} data-testid="remove-stroke-button">
    <MinusIcon />
  </button>
{:else}
  <button on:click={onAddStroke} data-testid="add-stroke">
    <PlusIcon />
  </button>
{/if}
