<script lang="ts">
  import { tooltip } from '$lib/attachments/tooltip';
  import MinusIcon from '$lib/components/icons/MinusIcon.svelte';
  import PlusIcon from '$lib/components/icons/PlusIcon.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import type { ConstantStroke } from '$lib/types';

  interface Props {
    layerId: string;
    stroke: ConstantStroke;
  }

  let { layerId, stroke }: Props = $props();

  async function onRemoveStroke() {
    const diff: CartoKitDiff = {
      type: 'remove-stroke' as const,
      layerId,
      payload: {}
    };

    await applyDiff(diff);
  }

  async function onAddStroke() {
    const diff: CartoKitDiff = {
      type: 'add-stroke' as const,
      layerId,
      payload: {}
    };

    await applyDiff(diff);
  }
</script>

{#if stroke.visible}
  <button
    onclick={onRemoveStroke}
    data-testid="remove-stroke-button"
    aria-label="Remove stroke"
    {@attach tooltip({
      content: 'Remove Stroke'
    })}
  >
    <MinusIcon />
  </button>
{:else}
  <button
    onclick={onAddStroke}
    data-testid="add-stroke"
    aria-label="Add stroke"
    {@attach tooltip({
      content: 'Add Stroke'
    })}
  >
    <PlusIcon />
  </button>
{/if}
