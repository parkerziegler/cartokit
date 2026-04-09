<script lang="ts">
  import MoreIcon from '$lib/components/icons/MoreIcon.svelte';
  import StepsEditor from '$lib/components/scale/StepsEditor.svelte';
  import Dialog from '$lib/components/shared/Dialog.svelte';
  import Portal from '$lib/components/shared/Portal.svelte';
  import Select from '$lib/components/shared/Select.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import { layout } from '$lib/stores/layout';
  import type { QuantitativeColorScale } from '$lib/types';
  import { CLASSIFICATION_METHODS } from '$lib/utils/classification';

  interface Props {
    layerId: string;
    attribute: string;
    scale: QuantitativeColorScale;
  }

  let { layerId, attribute, scale }: Props = $props();

  let displayBreaksEditor = $state(false);

  const options = CLASSIFICATION_METHODS.map((option) => ({
    value: option,
    label: option
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
        method: event.currentTarget.value as QuantitativeColorScale['type']
      }
    };

    await applyDiff(diff);
  }
</script>

<div class="flex items-center gap-2">
  <Select
    {options}
    selected={scale.type}
    title="Method"
    id="fill-classification-method-select"
    onchange={onClassificationMethodChange}
  />
  {#if scale.type === 'Manual'}
    <button onclick={showBreaksEditor}>
      <MoreIcon />
    </button>
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
        <StepsEditor {layerId} {attribute} {scale} />
      </Dialog>
    </Portal>
  {/if}
</div>
