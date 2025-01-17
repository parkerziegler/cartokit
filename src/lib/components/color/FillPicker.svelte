<script lang="ts">
  import * as d3 from 'd3';
  import { slide } from 'svelte/transition';

  import HexInput from '$lib/components/color/HexInput.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { ConstantFill } from '$lib/types';
  import { DEFAULT_FILL } from '$lib/utils/constants';

  interface Props {
    layerId: string;
    fill: ConstantFill;
  }

  let { layerId, fill }: Props = $props();

  function dispatchFillUpdate(color: string) {
    dispatchLayerUpdate({
      type: 'fill',
      layerId,
      payload: {
        color
      }
    });
  }

  function onFillInput(
    event: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    dispatchFillUpdate(event.currentTarget.value);
  }

  function onFillHexChange(hex: string) {
    dispatchFillUpdate(hex);
  }
</script>

<div class="color-picker stack stack-2xs" transition:slide>
  <div class="flex items-center">
    <FieldLabel fieldId="fill-color">Color</FieldLabel>
    <input
      type="color"
      id="fill-color"
      class="ml-4 mr-2 h-4 w-4 cursor-pointer appearance-none rounded"
      value={d3.color(fill.color)?.formatHex() ?? DEFAULT_FILL}
      oninput={onFillInput}
    />
    <HexInput
      hex={d3.color(fill.color)?.formatHex() ?? DEFAULT_FILL}
      testId="fill-color-input"
      onHexChange={onFillHexChange}
    />
  </div>
</div>
