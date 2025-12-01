<script lang="ts">
  import { tooltip } from '$lib/attachments/tooltip';
  import MinusIcon from '$lib/components/icons/MinusIcon.svelte';
  import PlusIcon from '$lib/components/icons/PlusIcon.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import type {
    CategoricalFill,
    ConstantFill,
    QuantitativeFill
  } from '$lib/types';

  interface Props {
    layerId: string;
    fill: CategoricalFill | ConstantFill | QuantitativeFill;
  }

  let { layerId, fill }: Props = $props();

  function onRemoveFill() {
    const diff: CartoKitDiff = {
      type: 'remove-fill',
      layerId,
      payload: {}
    };

    applyDiff(diff);
  }

  function onAddFill() {
    const diff: CartoKitDiff = {
      type: 'add-fill',
      layerId,
      payload: {}
    };

    applyDiff(diff);
  }
</script>

{#if fill.visible}
  <button
    onclick={onRemoveFill}
    {@attach tooltip({
      content: 'Remove Fill'
    })}
  >
    <MinusIcon />
  </button>
{:else}
  <button
    onclick={onAddFill}
    {@attach tooltip({
      content: 'Add Fill'
    })}
  >
    <PlusIcon />
  </button>
{/if}
