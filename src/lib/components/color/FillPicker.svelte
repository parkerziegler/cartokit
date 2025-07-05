<script lang="ts">
  import HexInput from '$lib/components/color/HexInput.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { ConstantFill } from '$lib/types';
  import { history } from '$lib/state/history.svelte';

  interface Props {
    layerId: string;
    fill: ConstantFill;
  }

  let { layerId, fill }: Props = $props();

  function dispatchFillUpdate(color: string) {
    const update = {
      type: 'fill' as const,
      layerId,
      payload: {
        color
      }
    };

    history.undo.push({
      execute: update,
      invert: {
        type: 'fill',
        layerId,
        payload: {
          color: fill.color
        }
      }
    });

    dispatchLayerUpdate(update);
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

<div class="flex items-center">
  <FieldLabel fieldId="fill-color">Color</FieldLabel>
  <input
    type="color"
    id="fill-color"
    class="mr-2 ml-4 h-4 w-4 cursor-pointer appearance-none rounded-sm"
    value={fill.color}
    oninput={onFillInput}
  />
  <HexInput
    hex={fill.color}
    testId="fill-color-input"
    onHexChange={onFillHexChange}
  />
</div>
