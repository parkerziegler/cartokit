<script lang="ts">
  import * as d3 from 'd3';

  import HexInput from '$lib/components/color/HexInput.svelte';
  import OpacityInput from '$lib/components/color/OpacityInput.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
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

  $: fill = d3.color(layer.style.fill)?.formatHex() ?? DEFAULT_FILL;
  $: stroke = d3.color(layer.style.stroke)?.formatHex() ?? DEFAULT_FILL;
  $: opacity = decimalToPercent(layer.style.opacity);

  function onColorInput(property: 'fill' | 'stroke') {
    return function handleColorInput(event: Event) {
      const target = event.target as HTMLInputElement;
      dispatchLayerUpdate({
        type: property,
        layer,
        payload: {
          color: target.value
        }
      });
    };
  }

  function onHexChange(property: 'fill' | 'stroke') {
    return function handleHexChange(hex: string) {
      dispatchLayerUpdate({
        type: property,
        layer,
        payload: {
          color: hex
        }
      });
    };
  }

  function onStrokeWidthChange(event: CustomEvent<{ value: number }>) {
    dispatchLayerUpdate({
      type: 'stroke-width',
      layer,
      payload: {
        strokeWidth: event.detail.value
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
      class="ml-4 mr-2 h-4 w-4 cursor-pointer appearance-none rounded"
      value={fill}
      on:input={onColorInput('fill')}
    />
    <HexInput hex={fill} onHexChange={onHexChange('fill')} />
  </div>
  <div class="flex items-center">
    <FieldLabel fieldId="stroke">Stroke</FieldLabel>
    <input
      type="color"
      class="ml-4 mr-2 h-4 w-4 cursor-pointer appearance-none rounded"
      value={stroke}
      on:input={onColorInput('stroke')}
    />
    <HexInput hex={stroke} onHexChange={onHexChange('stroke')} />
  </div>
  <div class="stack-h stack-h-xs items-center">
    <FieldLabel fieldId="stroke-width">Stroke Width</FieldLabel>
    <NumberInput
      value={layer.style.strokeWidth}
      on:change={onStrokeWidthChange}
    />
  </div>
  <OpacityInput {opacity} {onOpacityChange} />
</div>
