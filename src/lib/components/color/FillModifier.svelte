<script lang="ts">
  import MinusIcon from '$lib/components/icons/MinusIcon.svelte';
  import PlusIcon from '$lib/components/icons/PlusIcon.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type {
    CategoricalFill,
    ConstantFill,
    QuantitativeFill
  } from '$lib/types';

  export let layerId: string;
  export let fill:
    | CategoricalFill
    | ConstantFill
    | QuantitativeFill
    | undefined;

  function onRemoveFill() {
    dispatchLayerUpdate({
      type: 'remove-fill',
      layerId,
      payload: {}
    });
  }

  function onAddFill() {
    dispatchLayerUpdate({
      type: 'add-fill',
      layerId,
      payload: {}
    });
  }
</script>

{#if fill}
  <button on:click={onRemoveFill}>
    <MinusIcon />
  </button>
{:else}
  <button on:click={onAddFill}>
    <PlusIcon />
  </button>
{/if}
