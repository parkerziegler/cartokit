<script lang="ts">
  import MoreIcon from '$lib/components/icons/MoreIcon.svelte';
  import StepsEditor from '$lib/components/scale/StepsEditor.svelte';
  import Dialog from '$lib/components/shared/Dialog.svelte';
  import Portal from '$lib/components/shared/Portal.svelte';
  import Select from '$lib/components/shared/Select.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import type {
    ClassificationMethod,
    ContinuousQuantitativeStyle,
    DiscreteQuantitativeStyle
  } from '$lib/types';
  import { CLASSIFICATION_METHODS } from '$lib/utils/classification';
  import { layout } from '$lib/stores/layout';

  type QuantitativeMethod = ClassificationMethod | 'Continuous';

  interface Props {
    layerId: string;
    style: DiscreteQuantitativeStyle | ContinuousQuantitativeStyle;
  }

  let { layerId, style }: Props = $props();

  let displayBreaksEditor = $state(false);

  const options = ['Continuous', ...CLASSIFICATION_METHODS].map((method) => ({
    value: method,
    label: method
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
    const method = event.currentTarget.value as QuantitativeMethod;

    if (method === 'Manual') {
      showBreaksEditor();
    } else {
      hideBreaksEditor();
    }

    if (method === 'Continuous') {
      if (style.type === 'ContinuousQuantitative') {
        return;
      }

      await applyDiff({
        type: 'fill-visualization-type',
        layerId,
        payload: {
          visualizationType: 'ContinuousQuantitative'
        }
      });
      return;
    }

    if (style.type === 'ContinuousQuantitative') {
      await applyDiff({
        type: 'fill-visualization-type',
        layerId,
        payload: {
          visualizationType: 'DiscreteQuantitative'
        }
      });
    }

    const diff: CartoKitDiff = {
      type: 'fill-classification-method',
      layerId,
      payload: {
        method
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
  {#if style.type === 'DiscreteQuantitative' && style.method === 'Manual'}
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
    {#if style.type === 'DiscreteQuantitative'}
      <StepsEditor {layerId} {style} />
    {/if}
  </Dialog>
</Portal>
