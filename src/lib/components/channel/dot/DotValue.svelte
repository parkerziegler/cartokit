<script lang="ts">
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import type { CartoKitDotDensityLayer } from '$lib/types';

  interface Props {
    layer: CartoKitDotDensityLayer;
  }

  let { layer }: Props = $props();

  async function onDotValueChange(value: number) {
    const diff: CartoKitDiff = {
      type: 'dot-value',
      layerId: layer.id,
      payload: { value }
    };

    await applyDiff(diff);
  }
</script>

<div class="flex items-center gap-2">
  <FieldLabel fieldId="dot-value">Dot Value</FieldLabel>
  <NumberInput
    id="dot-value"
    min={0.000001}
    value={layer.style.dot.value}
    onchange={onDotValueChange}
    class="w-10"
  />
</div>
