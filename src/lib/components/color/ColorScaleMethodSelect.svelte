<script lang="ts">
  import ManualBreaks from '$lib/components/color/ManualBreaks.svelte';
  import Portal from '$lib/components/shared/Portal.svelte';
  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { CartoKitChoroplethLayer } from '$lib/types/CartoKitLayer';
  import { COLOR_SCALES, type ColorScale } from '$lib/types/color';

  export let layer: CartoKitChoroplethLayer;

  const target = document.getElementById('map') ?? document.body;
  let ref: Select<ColorScale>;
  let top = 0;
  let left = 0;
  let displayBreaksEditor = false;

  const options = COLOR_SCALES.map((scale) => ({
    value: scale,
    label: scale
  }));

  $: selected = layer.style.fill.scale;

  function onChange(event: CustomEvent<{ value: ColorScale }>) {
    if (event.detail.value === 'Manual') {
      ({ top, left } = ref.getBoundingClientRect());
      displayBreaksEditor = true;
    } else {
      displayBreaksEditor = false;
    }

    dispatchLayerUpdate({
      type: 'color-scale',
      layer,
      payload: {
        scale: event.detail.value
      }
    });
  }

  function toggleBreaksEditorVisibility() {
    displayBreaksEditor = !displayBreaksEditor;
  }

  function onClick(event: CustomEvent<{ value: ColorScale }>) {
    if (event.detail.value === 'Manual') {
      ({ top, left } = ref.getBoundingClientRect());
      toggleBreaksEditorVisibility();
    }
  }
</script>

<Select
  {options}
  {selected}
  title="Method"
  id="color-scale-method-select"
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
