<script lang="ts">
  import HexInput from '$lib/components/color/HexInput.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import type { ConstantFill } from '$lib/types';

  interface Props {
    layerId: string;
    fill: ConstantFill;
  }

  let { layerId, fill }: Props = $props();

  async function applyFillColorDiff(color: string) {
    const diff: CartoKitDiff = {
      type: 'fill-color',
      layerId,
      payload: {
        color
      }
    };

    await applyDiff(diff);
  }

  async function onFillInput(
    event: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    await applyFillColorDiff(event.currentTarget.value);
  }

  async function onFillHexChange(hex: string) {
    await applyFillColorDiff(hex);
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
