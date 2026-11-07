<script lang="ts">
  import { tooltip } from '$lib/attachments/tooltip';
  import MinusIcon from '$lib/components/icons/MinusIcon.svelte';
  import Button from '$lib/components/shared/Button.svelte';
  import Dialog from '$lib/components/shared/Dialog.svelte';
  import Portal from '$lib/components/shared/Portal.svelte';
  import {
    applyDiff,
    type CartoKitDiff,
    type RemoveLayerStrategy
  } from '$lib/core/diff';
  import { ir } from '$lib/stores/ir';
  import type { CartoKitLayer } from '$lib/types';
  import { conjugate, pluralize } from '$lib/utils/formatters/shared';
  import { getLayerDescendants } from '$lib/utils/ir';

  interface Props {
    layer: CartoKitLayer;
  }

  let { layer }: Props = $props();

  let ref: HTMLButtonElement | null = $state(null);
  let confirmRemoval = $state(false);
  let { left, top } = $derived.by(
    () => ref?.getBoundingClientRect() ?? new DOMRect(0, 0, 0, 0)
  );
  let descendants = $derived(getLayerDescendants($ir, layer.id));

  async function onClick() {
    if (descendants.size > 0) {
      confirmRemoval = true;
    } else {
      await removeLayer(layer.id, 'hard');
    }
  }

  async function onClickKeepData() {
    await removeLayer(layer.id, 'soft');
  }

  async function onClickRemoveDependantLayers() {
    return Promise.all(
      Array.from(descendants)
        .concat(layer.id)
        .map((layerId) => removeLayer(layerId, 'hard'))
    );
  }

  async function removeLayer(layerId: string, strategy: RemoveLayerStrategy) {
    const diff: CartoKitDiff = {
      type: 'remove-layer',
      layerId,
      payload: {
        sourceLayerType: layer.type,
        strategy
      }
    };

    await applyDiff(diff);
  }
</script>

<button
  {@attach tooltip({
    content: 'Remove Layer'
  })}
  bind:this={ref}
  onclick={onClick}
  class="flex h-7 w-7 items-center justify-center rounded-sm hover:bg-slate-500 focus:bg-slate-500"
  data-testid="remove-layer-button"
>
  <MinusIcon />
</button>
{#if confirmRemoval}
  <Portal class="absolute" style="top: {top}px; left: {left + 48}px;">
    <Dialog
      bind:showDialog={confirmRemoval}
      class="w-80 shadow-lg"
      testId="confirm-remove-layer-dialog"
    >
      {#snippet header()}
        <p class="font-sans text-sm font-medium tracking-wider">
          Remove this layer?
        </p>
      {/snippet}
      <div class="flex flex-col gap-3 px-4 pb-4">
        <p class="text-xs text-slate-400">
          {descendants.size}
          {pluralize('layer', descendants.size)}
          {conjugate('depend', descendants.size)} on this layer's data. Remove {descendants.size ===
          1
            ? 'it'
            : 'them'} too, or keep the data as needed?
        </p>
        <div class="flex justify-end gap-1 whitespace-nowrap">
          <Button variant="tiny" onclick={onClickKeepData}>Keep data</Button>
          <Button
            variant="tiny"
            onclick={onClickRemoveDependantLayers}
            class="border-oxide-red! bg-red-700 text-white"
            >Remove {descendants.size + 1} layers</Button
          >
        </div>
      </div>
    </Dialog>
  </Portal>
{/if}
