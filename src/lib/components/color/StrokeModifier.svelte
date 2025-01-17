<script lang="ts">
  import MinusIcon from '$lib/components/icons/MinusIcon.svelte';
  import PlusIcon from '$lib/components/icons/PlusIcon.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { ConstantStroke } from '$lib/types';

  interface Props {
    layerId: string;
    stroke?: ConstantStroke;
  }

  let { layerId, stroke }: Props = $props();

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
