<script lang="ts">
  import MoreIcon from '$lib/components/icons/MoreIcon.svelte';
  import StepsEditor from '$lib/components/scale/StepsEditor.svelte';
  import Dialog from '$lib/components/shared/Dialog.svelte';
  import Portal from '$lib/components/shared/Portal.svelte';
  import Select from '$lib/components/shared/Select.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import type { ClassificationMethod, QuantitativeStyle } from '$lib/types';
  import { CLASSIFICATION_METHODS } from '$lib/utils/classification';
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

  async function onClassificationMethodChange(
    event: Event & { currentTarget: EventTarget & HTMLSelectElement }
  ) {
    if (event.currentTarget.value === 'Manual') {
      showBreaksEditor();
    } else {
      hideBreaksEditor();
    }

    const diff: CartoKitDiff = {
      type: 'fill-classification-method',
      layerId,
      payload: {
        method: event.currentTarget.value as ClassificationMethod
      }
    };

    await applyDiff(diff);
  }
</script>

<div class="flex items-center gap-2">
  <Select
    {options}
    selected={style.method}
    title="Method"
    id="fill-classification-method-select"
    onchange={onClassificationMethodChange}
  />
  {#if style.method === 'Manual'}
    <button onclick={showBreaksEditor}>
      <MoreIcon />
    </button>
  {/if}
</div>
<Portal
  class={[
    'ease-cubic-out fixed top-64 right-150 transition-transform duration-400',
    {
      '-translate-x-[33.333333vw]': $layout.editorVisible,
      'delay-150': !$layout.editorVisible
    }
  ]}
>
  <Dialog bind:showDialog={displayBreaksEditor} class="w-64">
    {#snippet header()}
      <p class="font-sans text-sm font-medium tracking-wider">Set steps</p>
    {/snippet}
    <StepsEditor {layerId} {style} />
  </Dialog>
</Portal>
