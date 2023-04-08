<script lang="ts">
  import * as d3 from 'd3';

  import HexInput from '$lib/components/color/HexInput.svelte';
  import OpacityInput from '$lib/components/color/OpacityInput.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { map } from '$lib/stores/map';
  import { selectedLayer } from '$lib/stores/selected-layer';
  import { hasFill } from '$lib/types/CartoKitLayer';
  import { decimalToPercent } from '$lib/utils/color';
  import { DEFAULT_FILL, DEFAULT_OPACITY } from '$lib/utils/constants';
  import FieldLabel from '../shared/FieldLabel.svelte';

  $: color =
    $selectedLayer && hasFill($selectedLayer)
      ? d3.color($selectedLayer.style.fill)?.formatHex() ?? DEFAULT_FILL
      : DEFAULT_FILL;
  $: opacity = $selectedLayer
    ? decimalToPercent($selectedLayer.style.opacity)
    : decimalToPercent(DEFAULT_OPACITY);

  function onColorInput(event: Event) {
    const target = event.target as HTMLInputElement;

    if ($selectedLayer && $map) {
      dispatchLayerUpdate({
        type: 'fill',
        map: $map,
        layer: $selectedLayer,
        payload: {
          color: target.value
        }
      });
    }
  }

  function onHexChange(hex: string) {
    if ($selectedLayer && $map) {
      dispatchLayerUpdate({
        type: 'fill',
        map: $map,
        layer: $selectedLayer,
        payload: {
          color: hex
        }
      });
    }
  }

  function onOpacityChange(opacity: number) {
    if ($selectedLayer && $map) {
      dispatchLayerUpdate({
        type: 'opacity',
        map: $map,
        layer: $selectedLayer,
        payload: {
          opacity
        }
      });
    }
  }
</script>

<div class="color-picker stack stack-xs">
  <div class="stack-h stack-h-xs items-center">
    <FieldLabel fieldId="fill">Fill</FieldLabel>
    <input
      type="color"
      class="h-4 w-4 cursor-pointer appearance-none rounded"
      value={color}
      on:input={onColorInput}
    />
    <HexInput hex={color} {onHexChange} />
  </div>
  <OpacityInput {opacity} {onOpacityChange} />
</div>
