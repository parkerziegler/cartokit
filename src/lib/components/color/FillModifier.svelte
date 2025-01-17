<script lang="ts">
  import MinusIcon from '$lib/components/icons/MinusIcon.svelte';
  import PlusIcon from '$lib/components/icons/PlusIcon.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type {
    CategoricalFill,
    ConstantFill,
    QuantitativeFill
  } from '$lib/types';

  interface Props {
    layerId: string;
    fill: CategoricalFill | ConstantFill | QuantitativeFill | undefined;
  }

  let { layerId, fill }: Props = $props();

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
  <button onclick={onRemoveFill}>
    <MinusIcon />
  </button>
{:else}
  <button onclick={onAddFill}>
    <PlusIcon />
  </button>
{/if}
