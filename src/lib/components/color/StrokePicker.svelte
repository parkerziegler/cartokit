<script lang="ts">
  import * as d3 from 'd3';
  import { slide } from 'svelte/transition';

  import HexInput from '$lib/components/color/HexInput.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { ConstantStroke } from '$lib/types';
  import { DEFAULT_STROKE } from '$lib/utils/constants';

  export let layerId: string;
  export let stroke: ConstantStroke;

  function onStrokeInput(event: Event) {
    const target = event.target as HTMLInputElement;
    dispatchLayerUpdate({
      type: 'stroke',
      layerId,
      payload: {
        color: target.value
      }
    });
  }

  function onStrokeHexChange(hex: string) {
    dispatchLayerUpdate({
      type: 'stroke',
      layerId,
      payload: {
        color: hex
      }
    });
  }

  function onStrokeWidthChange(event: CustomEvent<{ value: number }>) {
    dispatchLayerUpdate({
      type: 'stroke-width',
      layerId,
      payload: {
        strokeWidth: event.detail.value
      }
    });
  }
</script>

<div class="color-picker stack stack-2xs" transition:slide>
  <div class="flex items-center">
    <FieldLabel fieldId="stroke-color">Color</FieldLabel>
    <input
      type="color"
      id="stroke-color"
      class="ml-4 mr-2 h-4 w-4 cursor-pointer appearance-none rounded"
      value={d3.color(stroke.color)?.formatHex() ?? DEFAULT_STROKE}
      on:input={onStrokeInput}
    />
    <HexInput
      hex={d3.color(stroke.color)?.formatHex() ?? DEFAULT_STROKE}
      testId="stroke-color-input"
      onHexChange={onStrokeHexChange}
    />
  </div>
  <div class="stack-h stack-h-xs items-center">
    <FieldLabel fieldId="stroke-width-input">Width</FieldLabel>
    <NumberInput
      id="stroke-width-input"
      value={stroke.width}
      on:change={onStrokeWidthChange}
      class="w-10"
    />
  </div>
</div>
