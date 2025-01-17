<script lang="ts">
  import type { Feature } from 'geojson';

  import ManualBreaks from '$lib/components/color/ManualBreaks.svelte';
  import Portal from '$lib/components/shared/Portal.svelte';
  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { ClassificationMethod, QuantitativeStyle } from '$lib/types';
  import { CLASSIFICATION_METHODS } from '$lib/utils/classification';

  interface Props {
    layerId: string;
    style: QuantitativeStyle;
    features: Feature[];
  }

  let { layerId, style, features }: Props = $props();

  const target = document.getElementById('map') ?? document.body;
  let ref: Select<ClassificationMethod>;
  let top = $state(0);
  let left = $state(0);
  let displayBreaksEditor = $state(false);

  const options = CLASSIFICATION_METHODS.map((scale) => ({
    value: scale,
    label: scale
  }));

  function onClassificationMethodChange(
    event: Event & { currentTarget: EventTarget & HTMLSelectElement }
  ) {
    if (event.currentTarget.value === 'Manual') {
      ({ top, left } = ref.getBoundingClientRect());
      displayBreaksEditor = true;
    } else {
      displayBreaksEditor = false;
    }

    dispatchLayerUpdate({
      type: 'classification-method',
      layerId,
      payload: {
        method: event.currentTarget.value as ClassificationMethod
      }
    });
  }

  function toggleBreaksEditorVisibility() {
    displayBreaksEditor = !displayBreaksEditor;
  }

  function onClassificationMethodClick(
    event: Event & { currentTarget: EventTarget & HTMLSelectElement }
  ) {
    if (event.currentTarget.value === 'Manual') {
      ({ top, left } = ref.getBoundingClientRect());
      toggleBreaksEditorVisibility();
    }
  }
</script>

<Select
  {options}
  selected={style.method}
  title="Method"
  id="classification-method-select"
  onchange={onClassificationMethodChange}
  onclick={onClassificationMethodClick}
  bind:this={ref}
/>
{#if displayBreaksEditor}
  <Portal
    class="absolute"
    {target}
    style="top: {top}px; left: {left - 24 - 20 * 16}px;"
  >
    <ManualBreaks {layerId} {style} {features} {toggleBreaksEditorVisibility} />
  </Portal>
{/if}
