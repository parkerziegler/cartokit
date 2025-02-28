<script lang="ts">
  import MinusIcon from '$lib/components/icons/MinusIcon.svelte';
  import PlusIcon from '$lib/components/icons/PlusIcon.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { history } from '$lib/state/history.svelte';
  import type {
    CategoricalFill,
    ConstantFill,
    QuantitativeFill
  } from '$lib/types';

  interface Props {
    layerId: string;
    fill?: CategoricalFill | ConstantFill | QuantitativeFill;
  }

  let { layerId, fill }: Props = $props();

  function onRemoveFill() {
    const update = {
      type: 'remove-fill' as const,
      layerId,
      payload: {}
    };

    history.undo.push({
      execute: update,
      invert: {
        type: 'add-fill',
        layerId,
        payload: {}
      }
    });

    dispatchLayerUpdate(update);
  }

  function onAddFill() {
    const update = {
      type: 'add-fill' as const,
      layerId,
      payload: {}
    };

    history.undo.push({
      execute: update,
      invert: {
        type: 'remove-fill',
        layerId,
        payload: {}
      }
    });

    dispatchLayerUpdate(update);
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
