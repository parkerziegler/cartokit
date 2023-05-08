<script lang="ts">
  import * as d3 from 'd3';

  import HexInput from '$lib/components/color/HexInput.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { CartoKitLayer } from '$lib/types/CartoKitLayer';
  import { DEFAULT_STROKE } from '$lib/utils/constants';

  export let layer: CartoKitLayer;

  $: stroke = d3.color(layer.style.stroke)?.formatHex() ?? DEFAULT_STROKE;

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

<div class="color-picker flex items-center">
  <FieldLabel fieldId="stroke">Stroke</FieldLabel>
  <input
    type="color"
    class="ml-4 mr-2 h-4 w-4 cursor-pointer appearance-none rounded"
    value={stroke}
    on:input={onStrokeInput}
  />
  <HexInput hex={stroke} onHexChange={onStrokeHexChange} />
</div>
<div class="stack-h stack-h-xs items-center">
  <FieldLabel fieldId="stroke-width">Stroke Width</FieldLabel>
  <NumberInput
    value={layer.style.strokeWidth}
    on:change={onStrokeWidthChange}
    class="w-12"
  />
</div>
