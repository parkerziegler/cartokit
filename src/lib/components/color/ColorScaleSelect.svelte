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
  let dimensions = {
    top: 0,
    left: 0,
    right: 0
  };

  $: selected = layer.style.fill.scale;
  const options = COLOR_SCALES.map((scale) => ({
    value: scale,
    label: scale
  }));

  let displayBreaksEditor = false;

  function onChange(event: CustomEvent<{ value: ColorScale }>) {
    if (event.detail.value === 'Manual') {
      const { top, left, right } = ref.getBoundingClientRect();
      dimensions = { top, left, right };
      displayBreaksEditor = true;
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
</script>

<Select
  {options}
  {selected}
  on:change={onChange}
  title="Method"
  bind:this={ref}
/>
{#if displayBreaksEditor}
  <Portal
    class="absolute"
    {target}
    style="top: {dimensions.top}px; right: {dimensions.right -
      dimensions.left +
      32 * 2}px;"
  >
    <ManualBreaks {layer} {toggleBreaksEditorVisibility} />
  </Portal>
{/if}
