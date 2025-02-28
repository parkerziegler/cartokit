<script lang="ts">
  import MinusIcon from '$lib/components/icons/MinusIcon.svelte';
  import PlusIcon from '$lib/components/icons/PlusIcon.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { history } from '$lib/state/history.svelte';
  import type { ConstantStroke } from '$lib/types';

  interface Props {
    layerId: string;
    stroke?: ConstantStroke;
  }

  let { layerId, stroke }: Props = $props();

  function onRemoveStroke() {
    const update = {
      type: 'remove-stroke' as const,
      layerId,
      payload: {}
    };

    history.undo.push({
      execute: update,
      invert: {
        type: 'add-stroke',
        layerId,
        payload: {}
      }
    });

    dispatchLayerUpdate(update);
  }

  function onAddStroke() {
    const update = {
      type: 'add-stroke' as const,
      layerId,
      payload: {}
    };

    history.undo.push({
      execute: update,
      invert: {
        type: 'remove-stroke',
        layerId,
        payload: {}
      }
    });

    dispatchLayerUpdate(update);
  }
</script>

{#if stroke}
  <button
    onclick={onRemoveStroke}
    data-testid="remove-stroke-button"
    aria-label="Remove stroke"
  >
    <MinusIcon />
  </button>
{:else}
  <button
    onclick={onAddStroke}
    data-testid="add-stroke"
    aria-label="Add stroke"
  >
    <PlusIcon />
  </button>
{/if}
