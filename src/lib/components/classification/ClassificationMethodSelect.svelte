<script lang="ts">
  import ManualBreaks from '$lib/components/color/ManualBreaks.svelte';
  import MoreIcon from '$lib/components/icons/MoreIcon.svelte';
  import Dialog from '$lib/components/shared/Dialog.svelte';
  import Portal from '$lib/components/shared/Portal.svelte';
  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { ClassificationMethod, QuantitativeStyle } from '$lib/types';
  import { CLASSIFICATION_METHODS } from '$lib/utils/classification';
  import { history } from '$lib/state/history.svelte';
  import { layout } from '$lib/stores/layout';

  interface Props {
    layerId: string;
    style: QuantitativeStyle;
  }

  let { layerId, style }: Props = $props();

  let displayBreaksEditor = $state(false);

  const options = CLASSIFICATION_METHODS.map((scale) => ({
    value: scale,
    label: scale
  }));

  function showBreaksEditor() {
    displayBreaksEditor = true;
  }

  function hideBreaksEditor() {
    displayBreaksEditor = false;
  }

  function onClassificationMethodChange(
    event: Event & { currentTarget: EventTarget & HTMLSelectElement }
  ) {
    if (event.currentTarget.value === 'Manual') {
      showBreaksEditor();
    } else {
      hideBreaksEditor();
    }

    const update = {
      type: 'classification-method' as const,
      layerId,
      payload: {
        method: event.currentTarget.value as ClassificationMethod
      }
    };

    history.undo.push({
      execute: update,
      invert: {
        type: 'classification-method',
        layerId,
        payload: {
          method: style.method
        }
      }
    });

    dispatchLayerUpdate(update);
  }
</script>

<div class="flex items-center gap-2">
  <Select
    {options}
    selected={style.method}
    title="Method"
    id="classification-method-select"
    onchange={onClassificationMethodChange}
  />
  {#if style.method === 'Manual'}
    <button onclick={showBreaksEditor}>
      <MoreIcon />
    </button>
  {/if}
</div>
<Portal
  class="fixed top-64 right-150 transition-transform duration-400"
  style="transform: translateX({$layout.editorVisible ? '-33.333333vw' : 0})"
>
  <Dialog bind:showDialog={displayBreaksEditor} class="w-64">
    {#snippet header()}
      <p class="font-sans text-sm font-medium tracking-wider">Set steps</p>
    {/snippet}
    <ManualBreaks {layerId} {style} />
  </Dialog>
</Portal>
