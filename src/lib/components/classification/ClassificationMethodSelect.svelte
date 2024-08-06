<script lang="ts">
  import type { Feature } from 'geojson';

  import ManualBreaks from '$lib/components/color/ManualBreaks.svelte';
  import Portal from '$lib/components/shared/Portal.svelte';
  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { ClassificationMethod, QuantitativeStyle } from '$lib/types';
  import { CLASSIFICATION_METHODS } from '$lib/utils/classification';

  export let layerId: string;
  export let style: QuantitativeStyle;
  export let features: Feature[];

  const target = document.getElementById('map') ?? document.body;
  let ref: Select<ClassificationMethod>;
  let top = 0;
  let left = 0;
  let displayBreaksEditor = false;

  const options = CLASSIFICATION_METHODS.map((scale) => ({
    value: scale,
    label: scale
  }));

  function onChange(event: CustomEvent<{ value: ClassificationMethod }>) {
    if (event.detail.value === 'Manual') {
      ({ top, left } = ref.getBoundingClientRect());
      displayBreaksEditor = true;
    } else {
      displayBreaksEditor = false;
    }

    dispatchLayerUpdate({
      type: 'classification-method',
      layerId,
      payload: {
        method: event.detail.value
      }
    });
  }

  function toggleBreaksEditorVisibility() {
    displayBreaksEditor = !displayBreaksEditor;
  }

  function onClick(event: CustomEvent<{ value: ClassificationMethod }>) {
    if (event.detail.value === 'Manual') {
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
  on:change={onChange}
  on:click={onClick}
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
