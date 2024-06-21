<script lang="ts">
  import * as d3 from 'd3';
  import { slide } from 'svelte/transition';

  import HexInput from '$lib/components/color/HexInput.svelte';
  import OpacityInput from '$lib/components/color/OpacityInput.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type {
    CartoKitFillLayer,
    CartoKitPointLayer,
    CartoKitProportionalSymbolLayer,
    CartoKitDotDensityLayer
  } from '$lib/types/CartoKitLayer';
  import { DEFAULT_FILL } from '$lib/utils/constants';

  export let layer:
    | CartoKitPointLayer
    | CartoKitFillLayer
    | CartoKitProportionalSymbolLayer
    | CartoKitDotDensityLayer;

  function dispatchFillUpdate(color: string) {
    dispatchLayerUpdate({
      type: 'fill',
      layer,
      payload: {
        color
      }
    });
  }

  function onFillInput(event: Event) {
    const target = event.target as HTMLInputElement;
    dispatchFillUpdate(target.value);
  }

  function onFillHexChange(hex: string) {
    dispatchFillUpdate(hex);
  }
</script>

{#if layer.style.fill}
  <div class="color-picker stack stack-2xs" transition:slide>
    <div class="flex items-center">
      <FieldLabel fieldId="fill-color">Color</FieldLabel>
      <input
        type="color"
        id="fill-color"
        class="ml-4 mr-2 h-4 w-4 cursor-pointer appearance-none rounded"
        value={d3.color(layer.style.fill.color)?.formatHex() ?? DEFAULT_FILL}
        on:input={onFillInput}
      />
      <HexInput
        hex={d3.color(layer.style.fill.color)?.formatHex() ?? DEFAULT_FILL}
        testId="fill-color-input"
        onHexChange={onFillHexChange}
      />
    </div>
    <OpacityInput {layer} property="fill" />
  </div>
{/if}
