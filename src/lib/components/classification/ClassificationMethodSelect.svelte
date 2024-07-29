<script lang="ts">
  import ManualBreaks from '$lib/components/color/ManualBreaks.svelte';
  import Portal from '$lib/components/shared/Portal.svelte';
  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type {
    CartoKitChoroplethLayer,
    ClassificationMethod
  } from '$lib/types';
  import { CLASSIFICATION_METHODS } from '$lib/utils/classification';

  export let layer: CartoKitChoroplethLayer;

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
      layer,
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
  selected={layer.style.fill.method}
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
    <ManualBreaks {layer} {toggleBreaksEditorVisibility} />
  </Portal>
{/if}
