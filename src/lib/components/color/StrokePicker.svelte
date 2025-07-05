<script lang="ts">
  import HexInput from '$lib/components/color/HexInput.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { ConstantStroke } from '$lib/types';
  import { history } from '$lib/state/history.svelte';
  interface Props {
    layerId: string;
    stroke: ConstantStroke;
  }

  let { layerId, stroke }: Props = $props();

  function dispatchStrokeUpdate(color: string) {
    const update = {
      type: 'stroke' as const,
      layerId,
      payload: {
        color
      }
    };

    history.undo.push({
      execute: update,
      invert: {
        type: 'stroke',
        layerId,
        payload: {
          color: stroke.color
        }
      }
    });

    dispatchLayerUpdate(update);
  }

  function onStrokeInput(
    event: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    dispatchStrokeUpdate(event.currentTarget.value);
  }

  function onStrokeHexChange(hex: string) {
    dispatchStrokeUpdate(hex);
  }

  function onStrokeWidthChange(value: number) {
    const update = {
      type: 'stroke-width' as const,
      layerId,
      payload: {
        strokeWidth: value
      }
    };

    history.undo.push({
      execute: update,
      invert: {
        type: 'stroke-width',
        layerId,
        payload: {
          strokeWidth: stroke.width
        }
      }
    });

    dispatchLayerUpdate(update);
  }
</script>

<div class="flex flex-col gap-1">
  <div class="flex items-center">
    <FieldLabel fieldId="stroke-color">Color</FieldLabel>
    <input
      type="color"
      id="stroke-color"
      class="mr-2 ml-4 h-4 w-4 cursor-pointer appearance-none rounded-sm"
      value={stroke.color}
      oninput={onStrokeInput}
    />
    <HexInput
      hex={stroke.color}
      testId="stroke-color-input"
      onHexChange={onStrokeHexChange}
    />
  </div>
  <div class="flex items-center gap-2">
    <FieldLabel fieldId="stroke-width-input">Width</FieldLabel>
    <NumberInput
      id="stroke-width-input"
      value={stroke.width}
      onchange={onStrokeWidthChange}
      class="w-10"
    />
  </div>
</div>
