<script lang="ts">
  import * as d3 from 'd3';

  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import HexInput from '$lib/components/color/HexInput.svelte';
  import OpacityInput from '$lib/components/color/OpacityInput.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type {
    CartoKitFillLayer,
    CartoKitProportionalSymbolLayer,
    CartoKitDotDensityLayer
  } from '$lib/types/CartoKitLayer';
  import { decimalToPercent } from '$lib/utils/color';
  import { DEFAULT_FILL } from '$lib/utils/constants';

  export let layer:
    | CartoKitFillLayer
    | CartoKitProportionalSymbolLayer
    | CartoKitDotDensityLayer;

  $: color = d3.color(layer.style.fill)?.formatHex() ?? DEFAULT_FILL;
  $: opacity = decimalToPercent(layer.style.opacity);

  function onColorInput(event: Event) {
    const target = event.target as HTMLInputElement;
    dispatchLayerUpdate({
      type: 'fill',
      layer,
      payload: {
        color: target.value
      }
    });
  }

  function onHexChange(hex: string) {
    dispatchLayerUpdate({
      type: 'fill',
      layer,
      payload: {
        color: hex
      }
    });
  }

  function onOpacityChange(opacity: number) {
    dispatchLayerUpdate({
      type: 'opacity',
      layer,
      payload: {
        opacity
      }
    });
  }
</script>

<div class="color-picker stack stack-xs">
  <div class="flex items-center">
    <FieldLabel fieldId="fill">Fill</FieldLabel>
    <input
      type="color"
      class="ml-4 mr-2 h-4 w-4 cursor-pointer appearance-none rounded p-2"
      value={color}
      on:input={onColorInput}
    />
    <HexInput hex={color} {onHexChange} />
  </div>
  <OpacityInput {opacity} {onOpacityChange} />
</div>
