<script lang="ts">
  import ManualBreaks from '$lib/components/color/ManualBreaks.svelte';
  import Portal from '$lib/components/shared/Portal.svelte';
  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { COLOR_SCALES, type ColorScale } from '$lib/types/color';
  import type { CartoKitChoroplethLayer } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitChoroplethLayer;

  let target = document.getElementById('map') ?? undefined;
  let ref: Select<ColorScale>;
  let dimensions: DOMRect = {
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
    toJSON: () => {}
  };

  $: selected = layer.style.breaks.scale;
  const options = COLOR_SCALES.map((scale) => ({
    value: scale,
    label: scale
  }));

  let displayBreaksEditor = false;

  function onChange(event: CustomEvent<{ value: ColorScale }>) {
    if (event.detail.value === 'Manual') {
      dimensions = ref.getBoundingClientRect();
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
