<script lang="ts">
  import * as d3 from 'd3';
  import { slide } from 'svelte/transition';

  import HexInput from '$lib/components/color/HexInput.svelte';
  import OpacityInput from '$lib/components/color/OpacityInput.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { CartoKitLayer } from '$lib/types/CartoKitLayer';
  import { DEFAULT_STROKE } from '$lib/utils/constants';

  export let layer: CartoKitLayer;

  function onStrokeInput(event: Event) {
    const target = event.target as HTMLInputElement;
    dispatchLayerUpdate({
      type: 'stroke',
      layer,
      payload: {
        color: target.value
      }
    });
  }

  function onStrokeHexChange(hex: string) {
    dispatchLayerUpdate({
      type: 'stroke',
      layer,
      payload: {
        color: hex
      }
    });
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
</script>

{#if layer.style.stroke}
  <div class="color-picker stack stack-2xs" transition:slide>
    <div class="flex items-center">
      <FieldLabel fieldId="stroke-color">Color</FieldLabel>
      <input
        type="color"
        id="stroke-color"
        class="ml-4 mr-2 h-4 w-4 cursor-pointer appearance-none rounded"
        value={d3.color(layer.style.stroke.color)?.formatHex() ??
          DEFAULT_STROKE}
        on:input={onStrokeInput}
      />
      <HexInput
        hex={d3.color(layer.style.stroke.color)?.formatHex() ?? DEFAULT_STROKE}
        testId="stroke-color-input"
        onHexChange={onStrokeHexChange}
      />
    </div>
    <div class="stack-h stack-h-xs items-center">
      <FieldLabel fieldId="stroke-width-input">Width</FieldLabel>
      <NumberInput
        id="stroke-width-input"
        value={layer.style.stroke.width}
        on:change={onStrokeWidthChange}
        class="w-10"
      />
    </div>
    <OpacityInput {layer} property="stroke" />
  </div>
{/if}
